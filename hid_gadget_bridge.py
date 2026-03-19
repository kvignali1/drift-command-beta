import os
import re
import threading
from dataclasses import dataclass


@dataclass
class DispatchResult:
    ok: bool
    message: str
    command: str = ""
    detail: str = ""


class HidGadgetBridge:
    def __init__(self, device_path: str = "/dev/hidg0", button_count: int = 128):
        self.device_path = device_path
        self.button_count = max(8, min(128, int(button_count)))
        self.report_length = self.button_count // 8
        self._lock = threading.Lock()
        self._tap_timers = {}
        self._buttons = bytearray(self.report_length)
        self._device = None
        self._load_error = None

    def status(self):
        self._ensure_device()
        return {
            "ready": self._device is not None,
            "device_path": self.device_path,
            "button_count": self.button_count,
            "message": self._load_error or (f"HID gadget ready on {self.device_path}" if self._device else "HID gadget unavailable"),
        }

    def dispatch(self, output: str, output_type: str = "") -> DispatchResult:
        command = (output or "").strip()

        if not command:
            return DispatchResult(ok=False, message="No output configured")

        parsed = self._parse_command(command, output_type)

        if not parsed.ok:
            return parsed

        self._ensure_device()

        if self._device is None:
            return DispatchResult(
                ok=False,
                command=command,
                message="HID gadget not ready",
                detail=self._load_error or f"Make sure {self.device_path} exists and the gadget is configured",
            )

        action = parsed.detail

        try:
            with self._lock:
                button_number = int(action["button"])

                if action["mode"] == "set":
                    self._cancel_tap_timer(button_number)
                    self._set_button(button_number, action["state"])
                    self._write_report()
                elif action["mode"] == "tap":
                    self._cancel_tap_timer(button_number)
                    self._set_button(button_number, 1)
                    self._write_report()
                    timer = threading.Timer(action["duration_ms"] / 1000, self._release_button, args=(button_number,))
                    timer.daemon = True
                    self._tap_timers[button_number] = timer
                    timer.start()
                else:
                    return DispatchResult(ok=False, command=command, message="Unsupported HID gadget action")
        except Exception as error:
            self._load_error = str(error)
            return DispatchResult(ok=False, command=command, message="HID gadget dispatch failed", detail=str(error))

        return DispatchResult(ok=True, command=command, message="Dispatched to HID gadget")

    def _ensure_device(self):
        if self._device is not None or self._load_error:
            return

        try:
            self._device = open(self.device_path, "wb", buffering=0)
        except Exception as error:
            self._load_error = str(error)

    def _cancel_tap_timer(self, button_number: int):
        timer = self._tap_timers.pop(button_number, None)

        if timer:
            timer.cancel()

    def _release_button(self, button_number: int):
        with self._lock:
            if self._device is None:
                self._tap_timers.pop(button_number, None)
                return

            self._set_button(button_number, 0)
            self._write_report()
            self._tap_timers.pop(button_number, None)

    def _set_button(self, button_number: int, state: int):
        if button_number < 1 or button_number > self.button_count:
            raise ValueError(f"Button number must be between 1 and {self.button_count}")

        index = button_number - 1
        byte_index = index // 8
        bit_mask = 1 << (index % 8)

        if state:
            self._buttons[byte_index] |= bit_mask
        else:
            self._buttons[byte_index] &= ~bit_mask

    def _write_report(self):
        if self._device is None:
            raise RuntimeError("HID gadget device is not open")

        self._device.write(bytes(self._buttons))

    def _parse_command(self, command: str, output_type: str) -> DispatchResult:
        parts = [part.strip() for part in command.split(":") if part.strip()]

        if not parts:
            return DispatchResult(ok=False, command=command, message="Unsupported command format")

        prefix_token = parts[0].upper()
        action_index = 2

        if prefix_token == "BTN":
            if len(parts) < 2:
                return DispatchResult(ok=False, command=command, message="Unsupported command format")

            button_token = parts[1]
        else:
            shorthand_match = re.fullmatch(r"BTN(\d+)", prefix_token)

            if not shorthand_match:
                return DispatchResult(ok=False, command=command, message=f"Unsupported output prefix '{parts[0]}'")

            button_token = shorthand_match.group(1)
            action_index = 1

        try:
            button_number = int(button_token)
        except ValueError:
            return DispatchResult(ok=False, command=command, message="Invalid button number")

        if button_number < 1:
            return DispatchResult(ok=False, command=command, message="Button number must be 1 or higher")

        if len(parts) == action_index:
            inferred_state = 1 if output_type in {"press", "on"} else 0 if output_type in {"release", "off"} else 1
            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed HID button command",
                detail={"mode": "set", "button": button_number, "state": inferred_state},
            )

        action = parts[action_index].upper()

        if action in {"DOWN", "ON"}:
            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed HID button down command",
                detail={"mode": "set", "button": button_number, "state": 1},
            )

        if action in {"UP", "OFF"}:
            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed HID button up command",
                detail={"mode": "set", "button": button_number, "state": 0},
            )

        if action in {"TAP", "+", "-", "CW", "CCW"}:
            duration_ms = 80

            if len(parts) > action_index + 1:
                try:
                    duration_ms = max(20, int(parts[action_index + 1]))
                except ValueError:
                    return DispatchResult(ok=False, command=command, message="Invalid TAP duration")

            actual_button_number = button_number

            if action in {"-", "CCW"}:
                actual_button_number = button_number + 1

            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed HID button tap command",
                detail={"mode": "tap", "button": actual_button_number, "duration_ms": duration_ms},
            )

        return DispatchResult(ok=False, command=command, message=f"Unsupported button action '{parts[action_index]}'")
