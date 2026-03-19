import importlib
import re
import threading
from dataclasses import dataclass


@dataclass
class DispatchResult:
    ok: bool
    message: str
    command: str = ""
    detail: str = ""


class VJoyBridge:
    def __init__(self, device_id: int = 1):
        self.device_id = device_id
        self._lock = threading.Lock()
        self._tap_timers = {}
        self._device = None
        self._vjoy_module = None
        self._load_error = None

    def status(self):
        self._ensure_device()
        return {
            "ready": self._device is not None,
            "device_id": self.device_id,
            "message": self._load_error or (f"vJoy device {self.device_id} ready" if self._device else "vJoy unavailable"),
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
                message="vJoy not ready",
                detail=self._load_error or "Install/configure vJoy and pyvjoystick first",
            )

        action = parsed.detail

        try:
            with self._lock:
                button_number = int(action["button"])

                if action["mode"] == "set":
                    self._cancel_tap_timer(button_number)
                    self._device.set_button(button_number, action["state"])
                elif action["mode"] == "tap":
                    self._cancel_tap_timer(button_number)
                    self._device.set_button(button_number, 1)
                    timer = threading.Timer(action["duration_ms"] / 1000, self._release_button, args=(button_number,))
                    timer.daemon = True
                    self._tap_timers[button_number] = timer
                    timer.start()
                else:
                    return DispatchResult(ok=False, command=command, message="Unsupported vJoy action")
        except Exception as error:
            self._load_error = str(error)
            return DispatchResult(ok=False, command=command, message="vJoy dispatch failed", detail=str(error))

        return DispatchResult(ok=True, command=command, message="Dispatched to vJoy")

    def _ensure_device(self):
        if self._device is not None or self._load_error:
            return

        try:
            self._vjoy_module = importlib.import_module("pyvjoystick.vjoy")
            self._device = self._vjoy_module.VJoyDevice(self.device_id)
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

            self._device.set_button(button_number, 0)
            self._tap_timers.pop(button_number, None)

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
                message="Parsed vJoy button command",
                detail={"mode": "set", "button": button_number, "state": inferred_state},
            )

        action = parts[action_index].upper()

        if action in {"DOWN", "ON"}:
            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed vJoy button down command",
                detail={"mode": "set", "button": button_number, "state": 1},
            )

        if action in {"UP", "OFF"}:
            return DispatchResult(
                ok=True,
                command=command,
                message="Parsed vJoy button up command",
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
                message="Parsed vJoy button tap command",
                detail={"mode": "tap", "button": actual_button_number, "duration_ms": duration_ms},
            )

        return DispatchResult(ok=False, command=command, message=f"Unsupported button action '{parts[action_index]}'")
