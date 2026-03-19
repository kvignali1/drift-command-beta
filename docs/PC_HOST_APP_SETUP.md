# PC Host App Setup

This mode turns your Windows PC into the local Drift Command host. The server runs quietly on the PC, and the Raspberry Pi simply opens the PC's URL over the local network.

## Architecture

- Windows PC runs the Drift Command host app
- Host app listens on the LAN, default port `5000`
- Pi opens `http://<pc-ip>:5000`
- Control events go from Pi UI -> PC host app -> `vJoy` -> Assetto

## Runtime files

- `pc_host_app.pyw`
- `windows/build_pc_host.ps1`
- `server_app.py`
- `runtime_info.py`

## Development run on the PC

You can still run the app directly with Python:

```powershell
$env:DRIFT_COMMAND_HOST = "0.0.0.0"
$env:DRIFT_COMMAND_PORT = "5000"
$env:DRIFT_COMMAND_DEBUG = "0"
.\.venv\Scripts\python.exe app.py
```

Then on the Pi, open:

```text
http://<your-pc-ip>:5000
```

## Packaged host app build

From the project root on Windows:

```powershell
.\windows\build_pc_host.ps1
```

This produces a packaged Windows app in:

- `dist\DriftCommandHost\DriftCommandHost.exe`

## What the packaged app does

- starts without a console window
- binds to `0.0.0.0:5000` by default
- writes host info to:
  - `%LOCALAPPDATA%\DriftCommandHost\host-info.json`
- writes logs to:
  - `%LOCALAPPDATA%\DriftCommandHost\host.log`

## Finding the URL for the Pi

After launch, inspect:

- `%LOCALAPPDATA%\DriftCommandHost\host-info.json`

It contains candidate URLs like:

```json
{
  "host": "0.0.0.0",
  "port": 5000,
  "urls": [
    "http://localhost:5000",
    "http://192.168.1.25:5000"
  ]
}
```

Use the LAN IP on the Pi.

## Optional startup on login

If you want the host app to always be running on the PC:

1. Build the packaged app
2. Create a shortcut to `DriftCommandHost.exe`
3. Put that shortcut in the Windows Startup folder

Startup folder:

```text
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

## Notes

- This path keeps your current `vJoy` setup.
- The Pi does **not** need USB gadget/peripheral mode for this setup.
- The Pi only needs network access to the PC.
