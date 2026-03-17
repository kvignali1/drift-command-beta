const pageTrackEl = document.getElementById("page-track");
const pageDots = Array.from(document.querySelectorAll(".page-dot"));
const deleteConfirmModalEl = document.getElementById("delete-confirm-modal");
const confirmDeleteYesEl = document.getElementById("confirm-delete-yes");
const confirmDeleteNoEl = document.getElementById("confirm-delete-no");
const appShellEl = document.querySelector(".app-shell");

const TOTAL_LAYOUT_PAGES = 4;

let currentPage = 0;
let touchStartX = null;
let touchStartY = null;
let activeDrag = null;
let deleteTargetPage = null;
let pressedLiveControl = null;

const layoutTemplates = {
  four: {
    title: "4 Button Layout",
    slots: [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
    ],
  },
  six: {
    title: "6 Button Layout",
    slots: [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
    ],
  },
  three: {
    title: "3 Button Layout",
    slots: [
      { id: "1", extraClass: "slot-large" },
      { id: "2" },
      { id: "3" },
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

function getTelemetryPageMarkup() {
  return `
    <section class="page">
      <div class="dashboard telemetry-dashboard">
        <div class="telemetry-shell">
          <div class="telemetry-topbar">
            <div class="telemetry-mark">
              <div class="brand">DRIFT COMMAND</div>
              <div class="subbrand">Performance telemetry interface</div>
            </div>
            <div class="telemetry-status-pill">
              <span class="status-dot"></span>
              Live Telemetry
            </div>
          </div>

          <div class="telemetry-hud">
            <div class="telemetry-side">
              <div class="telemetry-card gear-panel">
                <div class="telemetry-label">Gear</div>
                <div id="gear" class="gear-value">N</div>
                <div id="drive-state" class="telemetry-note">Standby</div>
              </div>

              <div class="telemetry-card">
                <div class="telemetry-label">Shift Point</div>
                <div id="shift-threshold" class="telemetry-metric">7000</div>
                <div class="telemetry-note">RPM target</div>
              </div>
            </div>

            <div class="telemetry-center">
              <div class="rpm-ring-shell">
                <div id="rpm-ring" class="rpm-ring">
                  <div class="rpm-ring-core">
                    <div class="telemetry-label">Engine Speed</div>
                    <div class="rpm-readout">
                      <span id="rpm-text">0</span>
                      <span class="rpm-unit">RPM</span>
                    </div>
                    <div class="rpm-maxline">MAX <span id="rpm-max">9000</span></div>
                  </div>
                </div>
              </div>

              <div class="telemetry-bandline">
                <div id="power-band" class="band-chip">Idle</div>
                <div id="rpm-percent" class="band-percent">0%</div>
              </div>

              <div class="rpm-bar-outer">
                <div id="rpm-bar" class="rpm-bar-inner"></div>
              </div>

              <div id="shift-lights" class="shift-lights">
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
                <div class="light"></div>
              </div>
            </div>

            <div class="telemetry-side">
              <div class="telemetry-card">
                <div class="telemetry-label">Shift Status</div>
                <div id="shift-status" class="telemetry-metric">Build RPM</div>
                <div class="telemetry-note">Climb into the band</div>
              </div>

              <div class="telemetry-card">
                <div class="telemetry-label">Headroom</div>
                <div id="headroom-value" class="telemetry-metric">9000</div>
                <div class="telemetry-note">RPM remaining</div>
              </div>
            </div>
          </div>

          <div class="telemetry-grid">
            <div class="metric-tile">
              <div class="telemetry-label">Engine Load</div>
              <div id="load-value" class="grid-metric">0%</div>
            </div>
            <div class="metric-tile">
              <div class="telemetry-label">Power Band</div>
              <div id="band-value" class="grid-metric">Idle</div>
            </div>
            <div class="metric-tile">
              <div class="telemetry-label">Target</div>
              <div id="target-value" class="grid-metric">7000</div>
            </div>
            <div class="metric-tile">
              <div class="telemetry-label">Working Window</div>
              <div id="window-value" class="grid-metric">7000-9000</div>
            </div>
          </div>
        </div>

        <div class="swipe-hint">Swipe left for layout 1</div>
      </div>
    </section>
  `;
}

function getLayoutPickerMarkup() {
  return `
    <div class="layout-picker hidden">
      <button class="layout-option" type="button" data-layout="four">
        <div class="layout-option-title">4 Button Layout</div>
        <div class="layout-option-preview preview-four">
          <span class="layout-slot"></span>
          <span class="layout-slot"></span>
          <span class="layout-slot"></span>
          <span class="layout-slot"></span>
        </div>
      </button>

      <button class="layout-option" type="button" data-layout="six">
        <div class="layout-option-title">6 Button Layout</div>
        <div class="layout-option-preview preview-six">
          <div class="preview-column">
            <span class="layout-slot"></span>
            <span class="layout-slot"></span>
            <span class="layout-slot"></span>
          </div>
          <div class="preview-column">
            <span class="layout-slot"></span>
            <span class="layout-slot"></span>
            <span class="layout-slot"></span>
          </div>
        </div>
      </button>

      <button class="layout-option" type="button" data-layout="three">
        <div class="layout-option-title">3 Button Layout</div>
        <div class="layout-option-preview preview-three">
          <span class="layout-slot preview-large"></span>
          <div class="preview-column">
            <span class="layout-slot"></span>
            <span class="layout-slot"></span>
          </div>
        </div>
      </button>
    </div>
  `;
}

function getPaletteMarkup() {
  return `
    <div class="palette-list">
      <div class="palette-item" role="button" tabindex="0" data-component-type="button">
        <div class="palette-item-preview preview-button">
          <div class="control-face control-button-face">
            <div class="control-button-cap"></div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Button</div>
          <div class="palette-item-caption">Momentary push</div>
        </div>
      </div>

      <div class="palette-item" role="button" tabindex="0" data-component-type="toggle">
        <div class="palette-item-preview preview-toggle">
          <div class="control-face control-toggle-face">
            <div class="control-toggle-base"></div>
            <div class="control-toggle-lever"></div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Toggle</div>
          <div class="palette-item-caption">Metal switch</div>
        </div>
      </div>

      <div class="palette-item" role="button" tabindex="0" data-component-type="rocker">
        <div class="palette-item-preview preview-rocker">
          <div class="control-face control-rocker-face">
            <div class="control-rocker-top">ON</div>
            <div class="control-rocker-bottom">OFF</div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Rocker</div>
          <div class="palette-item-caption">Dash switch</div>
        </div>
      </div>

      <div class="palette-item" role="button" tabindex="0" data-component-type="light">
        <div class="palette-item-preview preview-light">
          <div class="control-face control-light-face">
            <div class="control-light-lens"></div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Light</div>
          <div class="palette-item-caption">Indicator lamp</div>
        </div>
      </div>

      <div class="palette-item" role="button" tabindex="0" data-component-type="start">
        <div class="palette-item-preview preview-start">
          <div class="control-face control-start-face">
            <div class="control-start-ring">
              <div class="control-start-core">START</div>
            </div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Start</div>
          <div class="palette-item-caption">Ignition button</div>
        </div>
      </div>
    </div>
  `;
}

function getLayoutPageMarkup(layoutPageIndex) {
  const pageNumber = layoutPageIndex + 1;
  const previousHint = layoutPageIndex === 0 ? "dashboard" : `layout ${pageNumber - 1}`;
  const nextHint = layoutPageIndex === TOTAL_LAYOUT_PAGES - 1 ? "" : ` or left for layout ${pageNumber + 1}`;

  return `
    <section class="page button-box-page" data-layout-page="${layoutPageIndex}">
      <div class="dashboard">
        <div class="button-box-topbar">
          <div class="menu-wrap">
            <button class="menu-toggle" type="button" aria-expanded="false">Menu +</button>
            <div class="menu-dropdown">
              <button class="settings-menu-item menu-item" type="button">Settings</button>
              <button class="edit-layout-menu-item menu-item" type="button">Edit Layout</button>
              <button class="delete-current-menu-item menu-item menu-item-danger" type="button">Delete Current</button>
            </div>
          </div>
        </div>

        <div class="header">
          <div class="brand">LAYOUT ${pageNumber}</div>
          <div class="subbrand">Create and customize button box page ${pageNumber}</div>
        </div>

        <div class="layout-empty-state">
          <div class="layout-card">
            <div class="layout-title">Create Layout</div>
            <div class="layout-copy">Build page ${pageNumber} with a preset layout, then customize it however you want.</div>
            <button class="create-layout-button" type="button">Create Layout</button>
          </div>
        </div>

        ${getLayoutPickerMarkup()}

        <div class="layout-builder hidden">
          <div class="builder-stage-shell">
            <div class="builder-stage-topbar">
              <div>
                <div class="layout-title builder-layout-title">4 Button Layout</div>
                <div class="layout-copy">Drag components from the tray into the layout slots.</div>
              </div>
            </div>

            <div class="layout-canvas"></div>

            <div class="builder-footer">
              <button class="builder-submit-button finalize-layout-button" type="button">Create Layout</button>
            </div>
          </div>

          <aside class="component-sidebar">
            <div class="component-sidebar-title">Component Tray</div>
            <div class="component-sidebar-copy">Drag controls into a slot. Drag a placed control back here to remove it.</div>
            <div class="component-dropzone">Drop Here To Remove</div>
            ${getPaletteMarkup()}
          </aside>
        </div>

        <div class="swipe-hint">Swipe right for ${previousHint}${nextHint}</div>
      </div>
    </section>
  `;
}

pageTrackEl.innerHTML = getTelemetryPageMarkup() + Array.from(
  { length: TOTAL_LAYOUT_PAGES },
  (_, index) => getLayoutPageMarkup(index),
).join("");

const telemetryRefs = {
  gearEl: document.getElementById("gear"),
  rpmTextEl: document.getElementById("rpm-text"),
  rpmMaxEl: document.getElementById("rpm-max"),
  rpmBarEl: document.getElementById("rpm-bar"),
  rpmRingEl: document.getElementById("rpm-ring"),
  rpmPercentEl: document.getElementById("rpm-percent"),
  driveStateEl: document.getElementById("drive-state"),
  shiftThresholdEl: document.getElementById("shift-threshold"),
  shiftStatusEl: document.getElementById("shift-status"),
  headroomValueEl: document.getElementById("headroom-value"),
  loadValueEl: document.getElementById("load-value"),
  bandValueEl: document.getElementById("band-value"),
  targetValueEl: document.getElementById("target-value"),
  windowValueEl: document.getElementById("window-value"),
  powerBandEl: document.getElementById("power-band"),
  lights: document.querySelectorAll("#shift-lights .light"),
};

const layoutPages = Array.from(document.querySelectorAll(".button-box-page")).map((pageEl, index) => ({
  index,
  pageEl,
  state: {
    mode: "start",
    selectedLayout: null,
    placedComponents: {},
  },
  refs: {
    menuToggleEl: pageEl.querySelector(".menu-toggle"),
    menuDropdownEl: pageEl.querySelector(".menu-dropdown"),
    settingsMenuItemEl: pageEl.querySelector(".settings-menu-item"),
    editLayoutMenuItemEl: pageEl.querySelector(".edit-layout-menu-item"),
    deleteCurrentMenuItemEl: pageEl.querySelector(".delete-current-menu-item"),
    createLayoutButtonEl: pageEl.querySelector(".create-layout-button"),
    layoutPickerEl: pageEl.querySelector(".layout-picker"),
    layoutEmptyStateEl: pageEl.querySelector(".layout-empty-state"),
    layoutBuilderEl: pageEl.querySelector(".layout-builder"),
    layoutCanvasEl: pageEl.querySelector(".layout-canvas"),
    builderLayoutTitleEl: pageEl.querySelector(".builder-layout-title"),
    layoutOptionEls: pageEl.querySelectorAll(".layout-option"),
    paletteItemEls: pageEl.querySelectorAll(".palette-item"),
    componentDropzoneEl: pageEl.querySelector(".component-dropzone"),
    finalizeLayoutButtonEl: pageEl.querySelector(".finalize-layout-button"),
  },
}));

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

function updateDashboard(data) {
  const gear = data.gear ?? "N";
  const rpm = data.rpm ?? 0;
  const rpmMax = data.rpm_max ?? 9000;
  const shiftThreshold = data.shift_light_threshold ?? 7000;
  const rpmPercent = Math.max(0, Math.min(100, (rpm / rpmMax) * 100));
  const roundedRpmPercent = Math.round(rpmPercent);
  const headroom = Math.max(0, rpmMax - rpm);
  const bandName = getBandName(rpm, shiftThreshold, rpmMax);
  const shiftStatus = getShiftStatus(rpm, shiftThreshold, rpmMax);
  const rpmAngle = `${Math.max(18, rpmPercent * 2.8)}deg`;

  telemetryRefs.gearEl.textContent = gear;
  telemetryRefs.rpmTextEl.textContent = rpm;
  telemetryRefs.rpmMaxEl.textContent = rpmMax;
  telemetryRefs.rpmBarEl.style.width = `${rpmPercent}%`;
  telemetryRefs.rpmRingEl.style.setProperty("--rpm-progress-angle", rpmAngle);
  telemetryRefs.rpmPercentEl.textContent = `${roundedRpmPercent}%`;
  telemetryRefs.driveStateEl.textContent = gear === "N" ? "Standby" : `Gear ${gear} engaged`;
  telemetryRefs.shiftThresholdEl.textContent = shiftThreshold;
  telemetryRefs.shiftStatusEl.textContent = shiftStatus;
  telemetryRefs.headroomValueEl.textContent = headroom;
  telemetryRefs.loadValueEl.textContent = `${roundedRpmPercent}%`;
  telemetryRefs.bandValueEl.textContent = bandName;
  telemetryRefs.targetValueEl.textContent = shiftThreshold;
  telemetryRefs.windowValueEl.textContent = `${shiftThreshold}-${rpmMax}`;
  telemetryRefs.powerBandEl.textContent = bandName;

  telemetryRefs.lights.forEach((light) => {
    light.className = "light";
  });

  const activeLights = Math.floor((rpmPercent / 100) * telemetryRefs.lights.length);

  telemetryRefs.lights.forEach((light, index) => {
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

async function fetchTelemetry() {
  try {
    const response = await fetch("/api/telemetry");
    const data = await response.json();
    updateDashboard(data);
  } catch (err) {
    console.error("Telemetry fetch failed:", err);
  }
}

function setPage(pageIndex) {
  currentPage = Math.max(0, Math.min(TOTAL_LAYOUT_PAGES, pageIndex));
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
    setPage(currentPage + 1);
  } else {
    setPage(currentPage - 1);
  }
}

function closeAllMenus() {
  layoutPages.forEach((page) => {
    page.refs.menuDropdownEl.classList.remove("open");
    page.refs.menuToggleEl.classList.remove("open");
    page.refs.menuToggleEl.setAttribute("aria-expanded", "false");
  });
}

function setMenuOpen(page, isOpen) {
  closeAllMenus();
  page.refs.menuDropdownEl.classList.toggle("open", isOpen);
  page.refs.menuToggleEl.classList.toggle("open", isOpen);
  page.refs.menuToggleEl.setAttribute("aria-expanded", String(isOpen));
}

function openDeleteConfirm(page) {
  deleteTargetPage = page;
  deleteConfirmModalEl.classList.remove("hidden");
  closeAllMenus();
}

function closeDeleteConfirm() {
  deleteTargetPage = null;
  deleteConfirmModalEl.classList.add("hidden");
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

function renderLayoutCanvas(page) {
  const { state, refs } = page;
  const template = layoutTemplates[state.selectedLayout];

  if (!template) {
    refs.layoutCanvasEl.innerHTML = "";
    return;
  }

  refs.layoutCanvasEl.className = `layout-canvas canvas-${state.selectedLayout}`;
  refs.layoutCanvasEl.innerHTML = template.slots.map((slot) => {
    const extraClass = slot.extraClass ? ` ${slot.extraClass}` : "";
    const componentType = state.placedComponents[slot.id];

    if (componentType) {
      return `
        <div class="drop-slot filled${extraClass}" data-slot-id="${slot.id}">
          ${getSlotControlMarkup(componentType)}
        </div>
      `;
    }

    const modeClass = state.mode === "live" ? " view-only" : "";
    return `<div class="drop-slot${extraClass}${modeClass}" data-slot-id="${slot.id}"></div>`;
  }).join("");
}

function renderLayoutPage(page) {
  const { state, refs } = page;

  refs.layoutEmptyStateEl.classList.toggle("hidden", state.mode !== "start");
  refs.layoutPickerEl.classList.toggle("hidden", state.mode !== "picker");
  refs.layoutBuilderEl.classList.toggle("hidden", state.mode !== "builder" && state.mode !== "live");
  refs.layoutBuilderEl.classList.toggle("live-mode", state.mode === "live");

  if (state.selectedLayout) {
    refs.builderLayoutTitleEl.textContent = layoutTemplates[state.selectedLayout].title;
    renderLayoutCanvas(page);
  } else {
    refs.layoutCanvasEl.innerHTML = "";
  }
}

function openLayoutPicker(page) {
  page.state.mode = "picker";
  renderLayoutPage(page);
  closeDeleteConfirm();
}

function openLayoutBuilder(page, layoutKey) {
  if (!layoutTemplates[layoutKey]) {
    return;
  }

  page.state.selectedLayout = layoutKey;
  page.state.placedComponents = {};
  page.state.mode = "builder";
  renderLayoutPage(page);
}

function resetLayoutFlow(page) {
  page.state.mode = page.state.selectedLayout ? "builder" : "picker";
  renderLayoutPage(page);
  closeDeleteConfirm();
  closeAllMenus();
}

function finalizeCurrentLayout(page) {
  if (!page.state.selectedLayout) {
    return;
  }

  page.state.mode = "live";
  renderLayoutPage(page);
}

function resetToCreateLayout(page) {
  page.state.selectedLayout = null;
  page.state.placedComponents = {};
  page.state.mode = "start";
  renderLayoutPage(page);
}

function shouldIgnoreSwipeTarget(target) {
  return Boolean(
    target.closest(".menu-wrap, .layout-option, .create-layout-button, .palette-item, .drop-slot, .slot-filled-button, .component-sidebar, .component-dropzone, .builder-submit-button, .confirm-dialog"),
  );
}

function clearSlotHighlights() {
  document.querySelectorAll(".drop-slot.active").forEach((slot) => {
    slot.classList.remove("active");
  });
}

function clearTrayHighlight() {
  document.querySelectorAll(".component-dropzone.drop-active").forEach((dropzone) => {
    dropzone.classList.remove("drop-active");
  });
}

function updateDragGhostPosition(clientX, clientY) {
  if (!activeDrag) {
    return;
  }

  activeDrag.ghostEl.style.left = `${clientX}px`;
  activeDrag.ghostEl.style.top = `${clientY}px`;
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

  return elements.some((element) => element.closest(".component-dropzone"));
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
  activeDrag.currentPage = null;
  activeDrag.currentSlotId = null;
  activeDrag.overTray = false;

  if (slot) {
    const pageEl = slot.closest(".button-box-page");
    const page = layoutPages.find((item) => item.pageEl === pageEl);

    if (page && page.state.mode === "builder") {
      slot.classList.add("active");
      activeDrag.currentPage = page;
      activeDrag.currentSlotId = slot.dataset.slotId;
    }
  } else if (isPointerOverComponentTray(event.clientX, event.clientY)) {
    const trayPageEl = document.elementsFromPoint(event.clientX, event.clientY)
      .find((element) => element.closest(".button-box-page"))
      ?.closest(".button-box-page");

    const trayPage = layoutPages.find((item) => item.pageEl === trayPageEl);

    if (trayPage) {
      trayPage.refs.componentDropzoneEl.classList.add("drop-active");
      activeDrag.currentPage = trayPage;
      activeDrag.overTray = true;
    }
  }
}

function stopDrag(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
    return;
  }

  event.preventDefault();

  if (activeDrag.currentPage && activeDrag.currentSlotId) {
    activeDrag.currentPage.state.placedComponents[activeDrag.currentSlotId] = activeDrag.componentType;

    if (
      activeDrag.originPage
      && activeDrag.originSlotId
      && (activeDrag.originPage !== activeDrag.currentPage || activeDrag.originSlotId !== activeDrag.currentSlotId)
    ) {
      delete activeDrag.originPage.state.placedComponents[activeDrag.originSlotId];
      renderLayoutPage(activeDrag.originPage);
    }

    renderLayoutPage(activeDrag.currentPage);
  } else if (activeDrag.overTray && activeDrag.originPage && activeDrag.originSlotId) {
    delete activeDrag.originPage.state.placedComponents[activeDrag.originSlotId];
    renderLayoutPage(activeDrag.originPage);
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

function startDrag(event, sourceEl, componentType, originPage = null, originSlotId = null) {
  event.preventDefault();
  event.stopPropagation();

  const component = componentCatalog[componentType] ?? componentCatalog.button;
  const ghostEl = document.createElement("div");
  ghostEl.className = "drag-ghost";
  ghostEl.textContent = component.label;
  document.body.appendChild(ghostEl);

  activeDrag = {
    pointerId: event.pointerId,
    sourceEl,
    componentType,
    originPage,
    originSlotId,
    currentPage: null,
    currentSlotId: null,
    overTray: false,
    ghostEl,
  };

  sourceEl.classList.add("dragging");
  updateDragGhostPosition(event.clientX, event.clientY);
  document.addEventListener("pointermove", handleDragMove);
  document.addEventListener("pointerup", stopDrag);
  document.addEventListener("pointercancel", stopDrag);
}

function handleLiveControlPress(event) {
  const pageEl = event.target.closest(".button-box-page");
  const page = layoutPages.find((item) => item.pageEl === pageEl);

  if (!page || page.state.mode !== "live") {
    return;
  }

  const filledControl = event.target.closest(".slot-filled-button");

  if (!filledControl) {
    return;
  }

  event.preventDefault();
  pressedLiveControl = filledControl;
  pressedLiveControl.classList.add("pressed");
}

function clearLiveControlPress() {
  if (!pressedLiveControl) {
    return;
  }

  pressedLiveControl.classList.remove("pressed");
  pressedLiveControl = null;
}

layoutPages.forEach((page) => {
  const { refs } = page;

  refs.menuToggleEl.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = refs.menuDropdownEl.classList.contains("open");
    setMenuOpen(page, !isOpen);
  });

  refs.settingsMenuItemEl.addEventListener("click", closeAllMenus);
  refs.editLayoutMenuItemEl.addEventListener("click", () => resetLayoutFlow(page));
  refs.deleteCurrentMenuItemEl.addEventListener("click", () => openDeleteConfirm(page));
  refs.createLayoutButtonEl.addEventListener("click", () => openLayoutPicker(page));
  refs.finalizeLayoutButtonEl.addEventListener("click", () => finalizeCurrentLayout(page));

  refs.layoutOptionEls.forEach((option) => {
    option.addEventListener("click", () => openLayoutBuilder(page, option.dataset.layout));
  });

  refs.paletteItemEls.forEach((paletteItem) => {
    paletteItem.addEventListener("pointerdown", (event) => {
      if (page.state.mode !== "builder") {
        return;
      }

      startDrag(event, paletteItem, paletteItem.dataset.componentType);
    });
  });

  refs.layoutCanvasEl.addEventListener("pointerdown", (event) => {
    if (page.state.mode === "builder") {
      const filledControl = event.target.closest(".slot-filled-button");

      if (filledControl) {
        const originSlot = filledControl.closest(".drop-slot");

        if (originSlot) {
          startDrag(event, filledControl, filledControl.dataset.componentType, page, originSlot.dataset.slotId);
          return;
        }
      }
    }

    handleLiveControlPress(event);
  });

  refs.layoutCanvasEl.addEventListener("pointerup", clearLiveControlPress);
  refs.layoutCanvasEl.addEventListener("pointerleave", clearLiveControlPress);
  refs.layoutCanvasEl.addEventListener("pointercancel", clearLiveControlPress);

  renderLayoutPage(page);
});

confirmDeleteYesEl.addEventListener("click", () => {
  if (deleteTargetPage) {
    resetToCreateLayout(deleteTargetPage);
  }

  closeDeleteConfirm();
});

confirmDeleteNoEl.addEventListener("click", closeDeleteConfirm);

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    closeAllMenus();
  }

  if (!event.target.closest(".confirm-dialog") && !deleteConfirmModalEl.classList.contains("hidden")) {
    closeDeleteConfirm();
  }
});

document.addEventListener("pointerup", clearLiveControlPress);

appShellEl.addEventListener("touchstart", (event) => {
  if (shouldIgnoreSwipeTarget(event.target)) {
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

setInterval(fetchTelemetry, 100);
fetchTelemetry();
setPage(0);
closeDeleteConfirm();
