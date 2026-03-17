const pageTrackEl = document.getElementById("page-track");
const pageDots = [
  document.getElementById("dot-0"),
  document.getElementById("dot-1"),
];
const pressableButtons = document.querySelectorAll(".box-button, .create-layout-button, .layout-option");
const appShellEl = document.querySelector(".app-shell");
const menuToggleEl = document.getElementById("button-box-menu-toggle");
const menuDropdownEl = document.getElementById("button-box-menu");
const createLayoutButtonEl = document.getElementById("create-layout-button");
const layoutPickerEl = document.getElementById("layout-picker");
const layoutEmptyStateEl = document.querySelector(".layout-empty-state");

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
  const rpmRingEl = document.getElementById("rpm-ring");
  const rpmPercentEl = document.getElementById("rpm-percent");
  const driveStateEl = document.getElementById("drive-state");
  const shiftThresholdEl = document.getElementById("shift-threshold");
  const shiftStatusEl = document.getElementById("shift-status");
  const headroomValueEl = document.getElementById("headroom-value");
  const loadValueEl = document.getElementById("load-value");
  const bandValueEl = document.getElementById("band-value");
  const targetValueEl = document.getElementById("target-value");
  const windowValueEl = document.getElementById("window-value");
  const powerBandEl = document.getElementById("power-band");
  const lights = document.querySelectorAll("#shift-lights .light");

  const gear = data.gear ?? "N";
  const rpm = data.rpm ?? 0;
  const rpmMax = data.rpm_max ?? 9000;
  const shiftThreshold = data.shift_light_threshold ?? 7000;

  gearEl.textContent = gear;
  rpmTextEl.textContent = rpm;
  rpmMaxEl.textContent = rpmMax;

  const rpmPercent = Math.max(0, Math.min(100, (rpm / rpmMax) * 100));
  const roundedRpmPercent = Math.round(rpmPercent);
  const headroom = Math.max(0, rpmMax - rpm);
  const bandName = getBandName(rpm, shiftThreshold, rpmMax);
  const shiftStatus = getShiftStatus(rpm, shiftThreshold, rpmMax);
  const rpmAngle = `${Math.max(18, rpmPercent * 2.8)}deg`;

  rpmBarEl.style.width = `${rpmPercent}%`;
  rpmRingEl.style.setProperty("--rpm-progress-angle", rpmAngle);
  rpmPercentEl.textContent = `${roundedRpmPercent}%`;
  driveStateEl.textContent = gear === "N" ? "Standby" : `Gear ${gear} engaged`;
  shiftThresholdEl.textContent = shiftThreshold;
  shiftStatusEl.textContent = shiftStatus;
  headroomValueEl.textContent = headroom;
  loadValueEl.textContent = `${roundedRpmPercent}%`;
  bandValueEl.textContent = bandName;
  targetValueEl.textContent = shiftThreshold;
  windowValueEl.textContent = `${shiftThreshold}-${rpmMax}`;
  powerBandEl.textContent = bandName;

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

function getBandName(rpm, shiftThreshold, rpmMax) {
  if (rpm < 1800) {
    return "Idle";
  }

  if (rpm < shiftThreshold - 1400) {
    return "Build";
  }

  if (rpm < shiftThreshold) {
    return "Attack";
  }

  if (rpm < rpmMax) {
    return "Shift";
  }

  return "Limiter";
}

function getShiftStatus(rpm, shiftThreshold, rpmMax) {
  if (rpm >= rpmMax) {
    return "Lift Now";
  }

  if (rpm >= shiftThreshold) {
    return "Ready";
  }

  if (rpm >= shiftThreshold - 1000) {
    return "Close";
  }

  return "Build RPM";
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

  if (deltaX < 0) {
    setPage(1);
  } else {
    setPage(0);
  }
}

function setMenuOpen(isOpen) {
  menuDropdownEl.classList.toggle("open", isOpen);
  menuToggleEl.classList.toggle("open", isOpen);
  menuToggleEl.setAttribute("aria-expanded", String(isOpen));
}

function isMenuEventTarget(target) {
  return Boolean(target.closest(".menu-wrap"));
}

function openLayoutPicker() {
  layoutEmptyStateEl.classList.add("hidden");
  layoutPickerEl.classList.remove("hidden");
}

appShellEl.addEventListener("touchstart", (event) => {
  if (isMenuEventTarget(event.target)) {
    touchStartX = null;
    touchStartY = null;
    return;
  }

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

function toggleMenu(event) {
  event.preventDefault();
  event.stopPropagation();
  setMenuOpen(!menuDropdownEl.classList.contains("open"));
}

menuToggleEl.addEventListener("pointerdown", toggleMenu);

menuDropdownEl.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    setMenuOpen(false);
  }
});

createLayoutButtonEl.addEventListener("click", openLayoutPicker);

pressableButtons.forEach((button) => {
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
setMenuOpen(false);
layoutPickerEl.classList.add("hidden");
