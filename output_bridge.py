import os

from hid_gadget_bridge import HidGadgetBridge
from vjoy_bridge import VJoyBridge


class OutputBridge:
    def __init__(self):
        backend_name = os.environ.get("DRIFT_COMMAND_OUTPUT_BACKEND", "auto").strip().lower()
        self.backend_name = backend_name
        self.backend = self._create_backend(backend_name)

    def dispatch(self, output: str, output_type: str = ""):
        return self.backend.dispatch(output=output, output_type=output_type)

    def status(self):
        status = self.backend.status()
        status["backend"] = self._resolved_backend_name()
        return status

    def _create_backend(self, backend_name: str):
        if backend_name == "auto":
            if os.name == "nt":
                return VJoyBridge(device_id=int(os.environ.get("DRIFT_COMMAND_VJOY_ID", "1")))

            return HidGadgetBridge(
                device_path=os.environ.get("DRIFT_COMMAND_HID_PATH", "/dev/hidg0"),
                button_count=int(os.environ.get("DRIFT_COMMAND_HID_BUTTONS", "128")),
            )

        if backend_name == "vjoy":
            return VJoyBridge(device_id=int(os.environ.get("DRIFT_COMMAND_VJOY_ID", "1")))

        if backend_name in {"hid", "hidgadget", "hid_gadget"}:
            return HidGadgetBridge(
                device_path=os.environ.get("DRIFT_COMMAND_HID_PATH", "/dev/hidg0"),
                button_count=int(os.environ.get("DRIFT_COMMAND_HID_BUTTONS", "128")),
            )

        raise ValueError(f"Unsupported DRIFT_COMMAND_OUTPUT_BACKEND '{backend_name}'")

    def _resolved_backend_name(self):
        if isinstance(self.backend, VJoyBridge):
            return "vjoy"

        if isinstance(self.backend, HidGadgetBridge):
            return "hid_gadget"

        return self.backend_name
