param(
  [string]$PythonExe = ".\.venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PythonExe)) {
  throw "Python executable not found at $PythonExe"
}

& $PythonExe -m pip install -r requirements.txt
& $PythonExe -m pip install pyinstaller

& $PythonExe -m PyInstaller `
  --noconfirm `
  --clean `
  --windowed `
  --name DriftCommandHost `
  --add-data "templates;templates" `
  --add-data "static;static" `
  pc_host_app.pyw
