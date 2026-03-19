import os
import time
from flask import Flask, render_template, jsonify, request

from vjoy_bridge import VJoyBridge

app = Flask(__name__)
vjoy_bridge = VJoyBridge(device_id=int(os.environ.get("DRIFT_COMMAND_VJOY_ID", "1")))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/telemetry")
def telemetry():
    # Simple mock telemetry for prototype testing
    t = time.time()

    rpm = int(900 + (abs((t * 1.6) % 2 - 1) * 6500))
    gears = ["N", "1", "2", "3", "4", "5", "6"]
    gear = gears[int((t / 3) % len(gears))]

    return jsonify({
        "gear": gear,
        "rpm": rpm,
        "rpm_max": 9000,
        "shift_light_threshold": 7000
    })


@app.route("/api/control-event", methods=["POST"])
def control_event():
    payload = request.get_json(silent=True) or {}
    output = payload.get("output", "")
    output_type = payload.get("outputType", "")
    result = vjoy_bridge.dispatch(output=output, output_type=output_type)
    print(f"[control-event] payload={payload} result={result}", flush=True)
    return jsonify({
        "ok": True,
        "received": payload,
        "dispatched": result.ok,
        "dispatch_message": result.message,
        "dispatch_detail": result.detail,
        "vjoy_status": vjoy_bridge.status(),
    })


@app.route("/api/output-status")
def output_status():
    return jsonify({
        "vjoy": vjoy_bridge.status(),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
