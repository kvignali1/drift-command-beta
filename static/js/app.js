const pageTrackEl = document.getElementById("page-track");
const pageDots = [
  document.getElementById("dot-0"),
  document.getElementById("dot-1"),
];
const boxButtons = document.querySelectorAll(".box-button");
const appShellEl = document.querySelector(".app-shell");

let currentPage = 0;
let touchStartX = null;
let touchStartY = null;

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

function setPage(pageIndex) {
  currentPage = Math.max(0, Math.min(1, pageIndex));
  pageTrackEl.style.transform = `translateX(-${currentPage * 100}vw)`;

  pageDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentPage);
  });
}

function handleSwipe(deltaX) {
  if (Math.abs(deltaX) < 50) {
    return;
  }

  if (deltaX > 0) {
    setPage(1);
  } else {
    setPage(0);
  }
}

appShellEl.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

appShellEl.addEventListener("touchmove", (event) => {
  if (touchStartX === null || touchStartY === null) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    event.preventDefault();
  }
}, { passive: false });

appShellEl.addEventListener("touchend", (event) => {
  if (touchStartX === null) {
    return;
  }

  const touchEndX = event.changedTouches[0].clientX;
  handleSwipe(touchEndX - touchStartX);
  touchStartX = null;
  touchStartY = null;
}, { passive: true });

appShellEl.addEventListener("touchcancel", () => {
  touchStartX = null;
  touchStartY = null;
});

boxButtons.forEach((button) => {
  const setPressed = () => {
    button.classList.add("pressed");
  };

  const clearPressed = () => {
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerdown", setPressed);
  button.addEventListener("pointerup", clearPressed);
  button.addEventListener("pointerleave", clearPressed);
  button.addEventListener("pointercancel", clearPressed);
});

setInterval(fetchTelemetry, 100);
fetchTelemetry();
setPage(0);
