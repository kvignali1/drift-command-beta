import time

from flask import Flask, jsonify, render_template, request

from output_bridge import OutputBridge
from runtime_info import build_server_urls


def create_app():
    app = Flask(__name__)
    output_bridge = OutputBridge()

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/api/telemetry")
    def telemetry():
        t = time.time()

        rpm = int(900 + (abs((t * 1.6) % 2 - 1) * 6500))
        gears = ["N", "1", "2", "3", "4", "5", "6"]
        gear = gears[int((t / 3) % len(gears))]

        return jsonify({
            "gear": gear,
            "rpm": rpm,
            "rpm_max": 9000,
            "shift_light_threshold": 7000,
        })

    @app.route("/api/control-event", methods=["POST"])
    def control_event():
        payload = request.get_json(silent=True) or {}
        output = payload.get("output", "")
        output_type = payload.get("outputType", "")
        result = output_bridge.dispatch(output=output, output_type=output_type)
        print(f"[control-event] payload={payload} result={result}", flush=True)
        return jsonify({
            "ok": True,
            "received": payload,
            "dispatched": result.ok,
            "dispatch_message": result.message,
            "dispatch_detail": result.detail,
            "output_status": output_bridge.status(),
        })

    @app.route("/api/output-status")
    def output_status():
        return jsonify({
            "output": output_bridge.status(),
        })

    @app.route("/api/host-info")
    def host_info():
        port = int(app.config.get("SERVER_PORT", 5000))
        return jsonify({
            "host": app.config.get("SERVER_HOST", "0.0.0.0"),
            "port": port,
            "urls": build_server_urls(port),
            "output": output_bridge.status(),
        })

    return app
