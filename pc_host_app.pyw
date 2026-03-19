import json
import os
import sys
from datetime import datetime
from pathlib import Path

from waitress import serve

from runtime_info import build_server_urls
from server_app import create_app


APP_NAME = "DriftCommandHost"


def get_appdata_dir():
    base_dir = os.environ.get("LOCALAPPDATA") or str(Path.home())
    appdata_dir = Path(base_dir) / APP_NAME
    appdata_dir.mkdir(parents=True, exist_ok=True)
    return appdata_dir


def configure_logging(appdata_dir: Path):
    log_path = appdata_dir / "host.log"
    log_file = open(log_path, "a", encoding="utf-8")
    timestamp = datetime.now().isoformat(timespec="seconds")
    log_file.write(f"[{timestamp}] Starting Drift Command host\n")
    log_file.flush()
    sys.stdout = log_file
    sys.stderr = log_file
    return log_path


def write_host_info(appdata_dir: Path, host: str, port: int):
    info_path = appdata_dir / "host-info.json"
    payload = {
        "host": host,
        "port": port,
        "urls": build_server_urls(port),
    }
    info_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return info_path


def main():
    host = os.environ.get("DRIFT_COMMAND_HOST", "0.0.0.0")
    port = int(os.environ.get("DRIFT_COMMAND_PORT", "5000"))
    appdata_dir = get_appdata_dir()
    configure_logging(appdata_dir)
    info_path = write_host_info(appdata_dir, host, port)

    app = create_app()
    app.config["SERVER_HOST"] = host
    app.config["SERVER_PORT"] = port

    print(f"Drift Command host info written to {info_path}", flush=True)
    print(f"Serving on {build_server_urls(port)}", flush=True)
    serve(app, host=host, port=port)


if __name__ == "__main__":
    main()
