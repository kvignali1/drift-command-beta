import os

from server_app import create_app

app = create_app()


if __name__ == "__main__":
    host = os.environ.get("DRIFT_COMMAND_HOST", "0.0.0.0")
    port = int(os.environ.get("DRIFT_COMMAND_PORT", "5000"))
    debug = os.environ.get("DRIFT_COMMAND_DEBUG", "1").strip().lower() in {"1", "true", "yes", "on"}
    app.config["SERVER_HOST"] = host
    app.config["SERVER_PORT"] = port
    app.run(host=host, port=port, debug=debug)
