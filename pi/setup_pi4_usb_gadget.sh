#!/bin/bash
set -euo pipefail

GADGET_ROOT="/sys/kernel/config/usb_gadget/driftcommand"
UDC_NAME="$(ls /sys/class/udc | head -n 1)"

if [[ -z "${UDC_NAME}" ]]; then
  echo "No UDC found. Make sure dwc2 peripheral mode is enabled on the Pi 4 USB-C port."
  exit 1
fi

sudo modprobe libcomposite
sudo mkdir -p "${GADGET_ROOT}"
cd "${GADGET_ROOT}"

echo 0x1d6b | sudo tee idVendor >/dev/null
echo 0x0104 | sudo tee idProduct >/dev/null
echo 0x0100 | sudo tee bcdDevice >/dev/null
echo 0x0200 | sudo tee bcdUSB >/dev/null

sudo mkdir -p strings/0x409
echo "DRFT0001" | sudo tee strings/0x409/serialnumber >/dev/null
echo "Drift Command" | sudo tee strings/0x409/manufacturer >/dev/null
echo "Drift Command Controller" | sudo tee strings/0x409/product >/dev/null

sudo mkdir -p configs/c.1/strings/0x409
echo "USB Gamepad" | sudo tee configs/c.1/strings/0x409/configuration >/dev/null
echo 250 | sudo tee configs/c.1/MaxPower >/dev/null

sudo mkdir -p functions/hid.usb0
echo 0 | sudo tee functions/hid.usb0/protocol >/dev/null
echo 0 | sudo tee functions/hid.usb0/subclass >/dev/null
echo 16 | sudo tee functions/hid.usb0/report_length >/dev/null
printf '\x05\x01\x09\x05\xa1\x01\x15\x00\x25\x01\x35\x00\x45\x01\x75\x01\x95\x80\x05\x09\x19\x01\x29\x80\x81\x02\xc0' | sudo tee functions/hid.usb0/report_desc >/dev/null

sudo ln -sf functions/hid.usb0 configs/c.1/
echo "${UDC_NAME}" | sudo tee UDC >/dev/null

echo "Drift Command HID gadget configured on ${UDC_NAME}"
