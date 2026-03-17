async function fetchTelemetry() {
  try {
    const response = await fetch("/api/telemetry");
    const data = await response.json();
    updateDashboard(data);
  } catch (err) {
    console.error("Telemetry fetch failed:", err);
  }
}

function updateDashboard(data) {
  const gearEl = document.getElementById("gear");
  const rpmTextEl = document.getElementById("rpm-text");
  const rpmMaxEl = document.getElementById("rpm-max");
  const rpmBarEl = document.getElementById("rpm-bar");
  const lights = document.querySelectorAll("#shift-lights .light");

  const gear = data.gear ?? "N";
  const rpm = data.rpm ?? 0;
  const rpmMax = data.rpm_max ?? 9000;

  gearEl.textContent = gear;
  rpmTextEl.textContent = rpm;
  rpmMaxEl.textContent = rpmMax;

  const rpmPercent = Math.max(0, Math.min(100, (rpm / rpmMax) * 100));
  rpmBarEl.style.width = `${rpmPercent}%`;

  lights.forEach((light) => {
    light.className = "light";
  });

  const activeLights = Math.floor((rpmPercent / 100) * lights.length);

  lights.forEach((light, index) => {
    if (index < activeLights) {
      light.classList.add("active");

      if (index < 4) {
        light.classList.add("green");
      } else if (index < 6) {
        light.classList.add("yellow");
      } else {
        light.classList.add("red");
      }
    }
  });
}

setInterval(fetchTelemetry, 100);
fetchTelemetry();
