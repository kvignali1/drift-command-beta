# Raspberry Pi 4 USB Controller Mode

This project can run on a Raspberry Pi 4 as a local fullscreen app and expose itself to a Windows PC as a USB game controller.

## Important Pi 4 hardware requirement

Raspberry Pi 4 peripheral mode works through the **USB-C power/OTG port**.

- The USB-C port must connect to the Windows PC.
- The Pi 4 must be powered another way, because the USB-C port cannot be used for both normal power input and reliable OTG peripheral mode at the same time.
- The easiest approach is powering the Pi through the GPIO header or through a setup that provides separate power while leaving USB-C free for the PC link.

Reference:
- Raspberry Pi OTG note: https://pip-assets.raspberrypi.com/categories/685-app-notes-guides-whitepapers/documents/RP-009276-WP-1-Using%20OTG%20mode%20on%20Raspberry%20Pi%20SBCs

## What this setup does

- Runs the Drift Command Flask app locally on the Pi
- Opens the UI in Chromium kiosk mode
- Sends control output to `/dev/hidg0`
- Makes Windows see the Pi as a USB HID game controller

## Files added for Pi mode

- `pi/setup_pi4_usb_gadget.sh`
- `pi/drift-command-usb-gadget.service`
- `pi/drift-command-web.service`
- `pi/drift-command-kiosk.service`
- `pi/launch_kiosk.sh`

## Install steps on the Pi

1. Copy the repo to the Pi, for example into `/opt/drift-command`.
2. Install system packages:

```bash
sudo apt update
sudo apt install -y python3 python3-venv chromium-browser curl
```

3. Create the Python environment:

```bash
cd /opt/drift-command
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

4. Enable USB peripheral mode in `/boot/firmware/config.txt`:

```ini
dtoverlay=dwc2,dr_mode=peripheral
```

5. Reboot the Pi.

6. Install the systemd units:

```bash
sudo cp pi/drift-command-usb-gadget.service /etc/systemd/system/
sudo cp pi/drift-command-web.service /etc/systemd/system/
sudo cp pi/drift-command-kiosk.service /etc/systemd/system/
sudo chmod +x pi/setup_pi4_usb_gadget.sh
sudo chmod +x pi/launch_kiosk.sh
```

7. Enable services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable drift-command-usb-gadget.service
sudo systemctl enable drift-command-web.service
sudo systemctl enable drift-command-kiosk.service
```

8. Power the Pi without using the USB-C OTG cable, then connect the Pi 4 USB-C port to the PC.

9. Reboot:

```bash
sudo reboot
```

## Windows result

If gadget mode comes up correctly, Windows should enumerate the Pi as a HID game controller. At that point the Drift Command UI running on the Pi drives the PC directly over USB, without `vJoy`.

## Current controller profile

The included HID gadget profile exposes:

- 128 buttons
- no axes

That matches the button-box style of this project well and keeps the USB reports simple.

## Current app backend selection

The app now supports:

- `DRIFT_COMMAND_OUTPUT_BACKEND=vjoy` for Windows development
- `DRIFT_COMMAND_OUTPUT_BACKEND=hid_gadget` for Pi USB-controller mode
- `DRIFT_COMMAND_OUTPUT_BACKEND=auto` to choose based on platform

## Notes

- Existing `BTN:*` outputs still work.
- Rotary and switch/button mappings continue to use the same output strings; only the backend changes.
- If Windows does not detect the controller, verify:
  - the Pi is really using the USB-C OTG port for the PC link
  - the Pi is externally powered
  - `/dev/hidg0` exists on the Pi
  - `systemctl status drift-command-usb-gadget.service`
