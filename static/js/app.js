const pageTrackEl = document.getElementById("page-track");
const pageDots = [
  document.getElementById("dot-0"),
  document.getElementById("dot-1"),
];
const pressableButtons = document.querySelectorAll(".box-button, .create-layout-button, .layout-option");
const appShellEl = document.querySelector(".app-shell");
const menuToggleEl = document.getElementById("button-box-menu-toggle");
const menuDropdownEl = document.getElementById("button-box-menu");
const settingsMenuItemEl = document.getElementById("settings-menu-item");
const editLayoutMenuItemEl = document.getElementById("edit-layout-menu-item");
const createLayoutButtonEl = document.getElementById("create-layout-button");
const layoutPickerEl = document.getElementById("layout-picker");
const layoutEmptyStateEl = document.querySelector(".layout-empty-state");
const layoutBuilderEl = document.getElementById("layout-builder");
const layoutCanvasEl = document.getElementById("layout-canvas");
const builderLayoutTitleEl = document.getElementById("builder-layout-title");
const layoutOptionEls = document.querySelectorAll(".layout-option");
const paletteItemEls = document.querySelectorAll(".palette-item");
const componentDropzoneEl = document.getElementById("component-dropzone");

let currentPage = 0;
let touchStartX = null;
let touchStartY = null;
let activeDrag = null;
let selectedLayout = null;

const layoutTemplates = {
  four: {
    title: "4 Button Layout",
    slots: [
      { id: "four-1" },
      { id: "four-2" },
      { id: "four-3" },
      { id: "four-4" },
    ],
  },
  six: {
    title: "6 Button Layout",
    slots: [
      { id: "six-1" },
      { id: "six-2" },
      { id: "six-3" },
      { id: "six-4" },
      { id: "six-5" },
      { id: "six-6" },
    ],
  },
  three: {
    title: "3 Button Layout",
    slots: [
      { id: "three-1", extraClass: "slot-large" },
      { id: "three-2" },
      { id: "three-3" },
    ],
  },
};

const componentCatalog = {
  button: { label: "Button" },
  toggle: { label: "Toggle" },
  rocker: { label: "Rocker" },
  light: { label: "Light" },
  start: { label: "Start" },
};

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
  layoutBuilderEl.classList.add("hidden");
  clearTrayHighlight();
}

function openLayoutBuilder(layoutKey) {
  const template = layoutTemplates[layoutKey];

  if (!template) {
    return;
  }

  selectedLayout = layoutKey;
  builderLayoutTitleEl.textContent = template.title;
  layoutCanvasEl.className = `layout-canvas canvas-${layoutKey}`;
  layoutCanvasEl.innerHTML = template.slots
    .map((slot) => {
      const extraClass = slot.extraClass ? ` ${slot.extraClass}` : "";
      return `<div class="drop-slot${extraClass}" data-slot-id="${slot.id}"></div>`;
    })
    .join("");

  layoutEmptyStateEl.classList.add("hidden");
  layoutPickerEl.classList.add("hidden");
  layoutBuilderEl.classList.remove("hidden");
}

function resetLayoutFlow() {
  layoutBuilderEl.classList.add("hidden");
  layoutPickerEl.classList.remove("hidden");
  setMenuOpen(false);
  clearTrayHighlight();
}

function shouldIgnoreSwipeTarget(target) {
  return Boolean(target.closest(".menu-wrap, .layout-option, .create-layout-button, .palette-item, .drop-slot, .slot-filled-button, .component-sidebar, .component-dropzone"));
}

function updateDragGhostPosition(clientX, clientY) {
  if (!activeDrag) {
    return;
  }

  activeDrag.ghostEl.style.left = `${clientX}px`;
  activeDrag.ghostEl.style.top = `${clientY}px`;
}

function clearSlotHighlights() {
  document.querySelectorAll(".drop-slot.active").forEach((slot) => {
    slot.classList.remove("active");
  });
}

function clearTrayHighlight() {
  componentDropzoneEl.classList.remove("drop-active");
}

function findDropSlotFromPoint(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);

  for (const element of elements) {
    const slot = element.closest(".drop-slot");

    if (slot) {
      return slot;
    }
  }

  return null;
}

function isPointerOverComponentTray(clientX, clientY) {
  const elements = document.elementsFromPoint(clientX, clientY);

  return elements.some((element) => element.closest("#component-dropzone"));
}

function getControlVisualMarkup(componentType) {
  switch (componentType) {
    case "toggle":
      return `
        <div class="control-face control-toggle-face">
          <div class="control-toggle-base"></div>
          <div class="control-toggle-lever"></div>
        </div>
      `;
    case "rocker":
      return `
        <div class="control-face control-rocker-face">
          <div class="control-rocker-top">ON</div>
          <div class="control-rocker-bottom">OFF</div>
        </div>
      `;
    case "light":
      return `
        <div class="control-face control-light-face">
          <div class="control-light-lens"></div>
        </div>
      `;
    case "start":
      return `
        <div class="control-face control-start-face">
          <div class="control-start-ring">
            <div class="control-start-core">START</div>
          </div>
        </div>
      `;
    case "button":
    default:
      return `
        <div class="control-face control-button-face">
          <div class="control-button-cap"></div>
        </div>
      `;
  }
}

function getSlotControlMarkup(componentType) {
  const component = componentCatalog[componentType] ?? componentCatalog.button;

  return `
    <div class="slot-filled-button" data-component-type="${componentType}">
      <div class="slot-control-visual">
        ${getControlVisualMarkup(componentType)}
      </div>
      <div class="slot-control-label">${component.label}</div>
    </div>
  `;
}

function fillDropSlot(slot, componentType) {
  slot.classList.add("filled");
  slot.dataset.componentType = componentType;
  slot.innerHTML = getSlotControlMarkup(componentType);
}

function clearDropSlot(slot) {
  slot.classList.remove("filled");
  delete slot.dataset.componentType;
  slot.innerHTML = "";
}

function handleDragMove(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
    return;
  }

  event.preventDefault();
  updateDragGhostPosition(event.clientX, event.clientY);
  clearSlotHighlights();
  clearTrayHighlight();

  const slot = findDropSlotFromPoint(event.clientX, event.clientY);
  const overTray = isPointerOverComponentTray(event.clientX, event.clientY);

  if (slot) {
    slot.classList.add("active");
    activeDrag.currentSlot = slot;
  } else {
    activeDrag.currentSlot = null;
  }

  if (overTray) {
    componentDropzoneEl.classList.add("drop-active");
  }

  activeDrag.overTray = overTray;
}

function stopDrag(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
    return;
  }

  event.preventDefault();

  if (activeDrag.currentSlot) {
    fillDropSlot(activeDrag.currentSlot, activeDrag.componentType);

    if (activeDrag.originSlot && activeDrag.originSlot !== activeDrag.currentSlot) {
      clearDropSlot(activeDrag.originSlot);
    }
  } else if (activeDrag.overTray && activeDrag.originSlot) {
    clearDropSlot(activeDrag.originSlot);
  }

  clearSlotHighlights();
  clearTrayHighlight();
  activeDrag.ghostEl.remove();
  activeDrag.sourceEl.classList.remove("dragging");
  document.removeEventListener("pointermove", handleDragMove);
  document.removeEventListener("pointerup", stopDrag);
  document.removeEventListener("pointercancel", stopDrag);
  activeDrag = null;
}

function startDrag(event, sourceEl, componentType, originSlot = null) {
  event.preventDefault();
  event.stopPropagation();

  const component = componentCatalog[componentType] ?? componentCatalog.button;
  const ghostEl = document.createElement("div");
  ghostEl.className = "drag-ghost";
  ghostEl.textContent = component.label;
  document.body.appendChild(ghostEl);

  activeDrag = {
    pointerId: event.pointerId,
    componentType,
    originSlot,
    overTray: false,
    sourceEl,
    ghostEl,
    currentSlot: null,
  };

  sourceEl.classList.add("dragging");
  updateDragGhostPosition(event.clientX, event.clientY);
  document.addEventListener("pointermove", handleDragMove);
  document.addEventListener("pointerup", stopDrag);
  document.addEventListener("pointercancel", stopDrag);
}

function startPaletteDrag(event) {
  const paletteItem = event.currentTarget;
  startDrag(event, paletteItem, paletteItem.dataset.componentType);
}

function startPlacedControlDrag(event) {
  const filledControl = event.target.closest(".slot-filled-button");

  if (!filledControl) {
    return;
  }

  const originSlot = filledControl.closest(".drop-slot");

  if (!originSlot) {
    return;
  }

  startDrag(event, filledControl, filledControl.dataset.componentType, originSlot);
}

appShellEl.addEventListener("touchstart", (event) => {
  if (isMenuEventTarget(event.target) || shouldIgnoreSwipeTarget(event.target)) {
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
settingsMenuItemEl.addEventListener("click", () => {
  setMenuOpen(false);
});
editLayoutMenuItemEl.addEventListener("click", resetLayoutFlow);
paletteItemEls.forEach((paletteItem) => {
  paletteItem.addEventListener("pointerdown", startPaletteDrag);
});
layoutCanvasEl.addEventListener("pointerdown", startPlacedControlDrag);

layoutOptionEls.forEach((option) => {
  option.addEventListener("click", () => {
    openLayoutBuilder(option.dataset.layout);
  });
});

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
layoutBuilderEl.classList.add("hidden");
