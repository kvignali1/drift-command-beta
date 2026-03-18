from flask import Flask, render_template, jsonify, request
import time

app = Flask(__name__)


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
    print(f"[control-event] {payload}", flush=True)
    return jsonify({"ok": True, "received": payload})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
