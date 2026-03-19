const pageTrackEl = document.getElementById("page-track");
const pageDots = Array.from(document.querySelectorAll(".page-dot"));
const deleteConfirmModalEl = document.getElementById("delete-confirm-modal");
const confirmDeleteYesEl = document.getElementById("confirm-delete-yes");
const confirmDeleteNoEl = document.getElementById("confirm-delete-no");
const controlConfigModalEl = document.getElementById("control-config-modal");
const controlConfigTitleEl = document.getElementById("control-config-title");
const controlConfigCopyEl = document.getElementById("control-config-copy");
const controlConfigNameEl = document.getElementById("control-config-name");
const controlConfigButtonNumberFieldEl = document.getElementById("control-config-button-number-field");
const controlConfigButtonNumberLabelEl = document.getElementById("control-config-button-number-label");
const controlConfigButtonNumberEl = document.getElementById("control-config-button-number");
const controlConfigEncoderCwButtonNumberFieldEl = document.getElementById("control-config-encoder-cw-button-number-field");
const controlConfigEncoderCwButtonNumberEl = document.getElementById("control-config-encoder-cw-button-number");
const controlConfigEncoderCcwButtonNumberFieldEl = document.getElementById("control-config-encoder-ccw-button-number-field");
const controlConfigEncoderCcwButtonNumberEl = document.getElementById("control-config-encoder-ccw-button-number");
const controlConfigSignalModeFieldEl = document.getElementById("control-config-signal-mode-field");
const controlConfigSignalModeEl = document.getElementById("control-config-signal-mode");
const controlConfigButtonModeFieldEl = document.getElementById("control-config-button-mode-field");
const controlConfigButtonModeEl = document.getElementById("control-config-button-mode");
const controlConfigColorFieldEl = document.getElementById("control-config-color-field");
const controlConfigColorEl = document.getElementById("control-config-color");
const controlConfigPressFieldEl = document.getElementById("control-config-press-field");
const controlConfigPressLabelEl = document.getElementById("control-config-press-label");
const controlConfigReleaseFieldEl = document.getElementById("control-config-release-field");
const controlConfigReleaseLabelEl = document.getElementById("control-config-release-label");
const controlConfigOnFieldEl = document.getElementById("control-config-on-field");
const controlConfigOnLabelEl = document.getElementById("control-config-on-label");
const controlConfigOffFieldEl = document.getElementById("control-config-off-field");
const controlConfigOffLabelEl = document.getElementById("control-config-off-label");
const controlConfigOutputPressEl = document.getElementById("control-config-output-press");
const controlConfigOutputReleaseEl = document.getElementById("control-config-output-release");
const controlConfigOutputOnEl = document.getElementById("control-config-output-on");
const controlConfigOutputOffEl = document.getElementById("control-config-output-off");
const controlConfigSaveEl = document.getElementById("control-config-save");
const controlConfigCancelEl = document.getElementById("control-config-cancel");
const appShellEl = document.querySelector(".app-shell");

const TOTAL_LAYOUT_PAGES = 4;
const TOTAL_TELEMETRY_PAGES = 3;
const LAYOUT_STORAGE_KEY = "drift-command-layout-state-v1";
const BUTTON_LED_THEMES = {
  red: {
    bright: "#ffb3b7",
    base: "#d8202d",
    shadow: "#7a0d16",
    glow: "rgba(216, 32, 45, 0.52)",
    soft: "rgba(216, 32, 45, 0.22)",
  },
  amber: {
    bright: "#ffe3a0",
    base: "#ff9f1f",
    shadow: "#7a4200",
    glow: "rgba(255, 159, 31, 0.52)",
    soft: "rgba(255, 159, 31, 0.2)",
  },
  green: {
    bright: "#d9ffbf",
    base: "#56d34d",
    shadow: "#1d6319",
    glow: "rgba(86, 211, 77, 0.5)",
    soft: "rgba(86, 211, 77, 0.2)",
  },
  blue: {
    bright: "#c3ecff",
    base: "#29a3ff",
    shadow: "#0f4579",
    glow: "rgba(41, 163, 255, 0.5)",
    soft: "rgba(41, 163, 255, 0.2)",
  },
  white: {
    bright: "#ffffff",
    base: "#d8e1ec",
    shadow: "#6b7480",
    glow: "rgba(226, 235, 245, 0.5)",
    soft: "rgba(226, 235, 245, 0.22)",
  },
};

let currentPage = 0;
let currentTelemetryPage = 0;
let touchStartX = null;
let touchStartY = null;
let pointerSwipe = null;
let activeDrag = null;
let deleteTargetPage = null;
let pressedLiveControl = null;
let liveToggleGesture = null;
let liveRotaryGesture = null;
let controlConfigTarget = null;

const layoutTemplates = {
  four: {
    title: "Classic Quad",
    columns: 2,
    rows: 2,
    slots: [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
    ],
  },
  six: {
    title: "Twin Triple",
    columns: 2,
    rows: 3,
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
    title: "Endurance Split",
    columns: 2,
    rows: 2,
    slots: [
      { id: "1", rowSpan: 2 },
      { id: "2" },
      { id: "3" },
    ],
  },
  three_row: {
    title: "Triple Row",
    columns: 3,
    rows: 1,
    slots: [
      { id: "1" },
      { id: "2" },
      { id: "3" },
    ],
  },
  four_console: {
    title: "Console Sweep",
    columns: 2,
    rows: 3,
    slots: [
      { id: "1", rowSpan: 2 },
      { id: "2" },
      { id: "3" },
      { id: "4", colSpan: 2 },
    ],
  },
  five_arc: {
    title: "Command Arc",
    columns: 4,
    rows: 2,
    slots: [
      { id: "1", colSpan: 2 },
      { id: "2" },
      { id: "3" },
      { id: "4", colSpan: 2 },
      { id: "5", colSpan: 2 },
    ],
  },
  five_wide: {
    title: "Wide Top Five",
    columns: 3,
    rows: 2,
    slots: [
      { id: "1", colSpan: 2 },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
    ],
  },
  six_bridge: {
    title: "Bridge Six",
    columns: 3,
    rows: 3,
    slots: [
      { id: "1", colSpan: 3 },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5", colSpan: 2 },
      { id: "6" },
    ],
  },
  seven_ladder: {
    title: "Race Ladder",
    columns: 3,
    rows: 3,
    slots: [
      { id: "1", colSpan: 3 },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
      { id: "7" },
    ],
  },
  seven_bridge: {
    title: "Command Bridge",
    columns: 4,
    rows: 3,
    slots: [
      { id: "1", colSpan: 2 },
      { id: "2", colSpan: 2 },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
      { id: "7", colStart: 2, colSpan: 2 },
    ],
  },
  eight_grid: {
    title: "Full Grid Eight",
    columns: 4,
    rows: 2,
    slots: [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
      { id: "7" },
      { id: "8" },
    ],
  },
  eight_tall: {
    title: "Tall Console Eight",
    columns: 3,
    rows: 3,
    slots: [
      { id: "1", rowSpan: 2 },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" },
      { id: "7" },
      { id: "8" },
    ],
  },
};

const orderedLayoutEntries = Object.entries(layoutTemplates)
  .sort(([, leftTemplate], [, rightTemplate]) => {
    const slotCountDifference = leftTemplate.slots.length - rightTemplate.slots.length;

    if (slotCountDifference !== 0) {
      return slotCountDifference;
    }

    return leftTemplate.title.localeCompare(rightTemplate.title);
  });

const componentCatalog = {
  button: { label: "Button" },
  rotary: { label: "Rotary" },
  toggle: { label: "Toggle" },
  rocker: { label: "Rocker" },
  light: { label: "Light" },
  start: { label: "Start" },
};

function getTelemetryPageMarkup() {
  return `
    <section class="page telemetry-page">
      <div class="dashboard telemetry-dashboard">
        <div class="telemetry-page-shell">
          <div class="telemetry-vertical-rail">
            <span class="telemetry-dot active"></span>
            <span class="telemetry-dot"></span>
            <span class="telemetry-dot"></span>
          </div>

          <div id="telemetry-track" class="telemetry-page-track">
            <section class="telemetry-screen telemetry-screen-vintage">
              <div class="telemetry-shell telemetry-shell-vintage">
                <div class="telemetry-topbar">
                  <div class="telemetry-mark">
                    <div class="brand">DRIFT COMMAND</div>
                    <div class="subbrand">Analog night run</div>
                  </div>
                  <div class="telemetry-status-pill">
                    <span class="status-dot"></span>
                    Vintage Cluster
                  </div>
                </div>

                <div class="analog-cluster">
                  <article class="hero-gauge tach-gauge">
                    <div class="gauge-title">Tachometer</div>
                    <div class="needle-gauge">
                      <div class="needle-dial"></div>
                      <div class="needle-arc"></div>
                      <div class="needle-pivot"></div>
                      <div class="needle" data-role="tach-needle"></div>
                      <div class="needle-readout">
                        <div class="needle-number" data-role="rpm">0</div>
                        <div class="needle-unit">RPM</div>
                      </div>
                    </div>
                    <div class="telemetry-note" data-role="shift-status">Build RPM</div>
                  </article>

                  <div class="analog-side-grid">
                    <article class="mini-gauge-card">
                      <div class="gauge-title">Boost</div>
                      <div class="mini-gauge-face">
                        <div class="mini-gauge-value"><span data-role="boost">0.0</span><span class="mini-unit">psi</span></div>
                      </div>
                    </article>
                    <article class="mini-gauge-card">
                      <div class="gauge-title">Voltage</div>
                      <div class="mini-gauge-face">
                        <div class="mini-gauge-value"><span data-role="voltage">12.8</span><span class="mini-unit">v</span></div>
                      </div>
                    </article>
                    <article class="mini-gauge-card">
                      <div class="gauge-title">Oil Temp</div>
                      <div class="mini-gauge-face">
                        <div class="mini-gauge-value"><span data-role="oil-temp">180</span><span class="mini-unit">F</span></div>
                      </div>
                    </article>
                    <article class="mini-gauge-card">
                      <div class="gauge-title">Water Temp</div>
                      <div class="mini-gauge-face">
                        <div class="mini-gauge-value"><span data-role="water-temp">176</span><span class="mini-unit">F</span></div>
                      </div>
                    </article>
                    <article class="mini-gauge-card">
                      <div class="gauge-title">Oil Pressure</div>
                      <div class="mini-gauge-face">
                        <div class="mini-gauge-value"><span data-role="oil-pressure">48</span><span class="mini-unit">psi</span></div>
                      </div>
                    </article>
                    <article class="mini-gauge-card gear-card-analog">
                      <div class="gauge-title">Gear</div>
                      <div class="mini-gauge-face mini-gauge-face-gear">
                        <div class="mini-gauge-gear" data-role="gear">N</div>
                        <div class="telemetry-note" data-role="drive-state">Standby</div>
                      </div>
                    </article>
                  </div>
                </div>

                <div class="telemetry-hint-strip">Swipe up for Pro Drift view or left for Layout 1</div>
              </div>
            </section>

            <section class="telemetry-screen telemetry-screen-drift">
              <div class="telemetry-shell telemetry-shell-drift">
                <div class="telemetry-topbar">
                  <div class="telemetry-mark">
                    <div class="brand">DRIFT COMMAND // ATTACK</div>
                    <div class="subbrand">Pro drift chase display</div>
                  </div>
                  <div class="telemetry-status-pill">
                    <span class="status-dot"></span>
                    Clipping Zone Live
                  </div>
                </div>

                <div class="drift-hero-grid">
                  <article class="drift-main-card">
                    <div class="telemetry-label">Engine Speed</div>
                    <div class="drift-rpm-number"><span data-role="rpm">0</span> <span class="rpm-unit">RPM</span></div>
                    <div class="drift-rpm-bar-outer">
                      <div class="drift-rpm-bar-inner" data-role="rpm-bar"></div>
                    </div>
                    <div class="drift-bandline">
                      <div class="band-chip" data-role="band-name">Idle</div>
                      <div class="band-percent" data-role="rpm-percent">0%</div>
                    </div>
                    <div class="shift-lights drift-shift-lights" data-role="shift-lights">
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                      <div class="light"></div>
                    </div>
                  </article>

                  <aside class="drift-side-stack">
                    <article class="drift-side-card drift-side-card-gear">
                      <div class="telemetry-label">Current Gear</div>
                      <div class="drift-gear" data-role="gear">N</div>
                      <div class="telemetry-note" data-role="drive-state">Standby</div>
                    </article>
                    <article class="drift-side-card">
                      <div class="telemetry-label">Boost</div>
                      <div class="telemetry-metric"><span data-role="boost">0.0</span> psi</div>
                    </article>
                    <article class="drift-side-card">
                      <div class="telemetry-label">Voltage</div>
                      <div class="telemetry-metric"><span data-role="voltage">12.8</span> v</div>
                    </article>
                  </aside>
                </div>

                <div class="telemetry-grid telemetry-grid-drift">
                  <div class="metric-tile">
                    <div class="telemetry-label">Oil Temp</div>
                    <div class="grid-metric"><span data-role="oil-temp">180</span>F</div>
                  </div>
                  <div class="metric-tile">
                    <div class="telemetry-label">Water Temp</div>
                    <div class="grid-metric"><span data-role="water-temp">176</span>F</div>
                  </div>
                  <div class="metric-tile">
                    <div class="telemetry-label">Oil Pressure</div>
                    <div class="grid-metric"><span data-role="oil-pressure">48</span> psi</div>
                  </div>
                  <div class="metric-tile">
                    <div class="telemetry-label">Shift Call</div>
                    <div class="grid-metric" data-role="shift-status">Build RPM</div>
                  </div>
                </div>

                <div class="telemetry-hint-strip">Swipe up for Endurance view or down for Vintage</div>
              </div>
            </section>

            <section class="telemetry-screen telemetry-screen-endurance">
              <div class="telemetry-shell telemetry-shell-endurance">
                <div class="telemetry-topbar">
                  <div class="telemetry-mark">
                    <div class="brand">DRIFT COMMAND // ENDURANCE</div>
                    <div class="subbrand">Le Mans inspired systems page</div>
                  </div>
                  <div class="telemetry-status-pill">
                    <span class="status-dot"></span>
                    Race Systems Armed
                  </div>
                </div>

                <div class="endurance-grid">
                  <article class="endurance-main">
                    <div class="endurance-rpm-panel">
                      <div class="telemetry-label">Power Unit</div>
                      <div class="endurance-rpm-number"><span data-role="rpm">0</span></div>
                      <div class="endurance-rpm-copy">RPM</div>
                      <div class="endurance-ring" data-role="rpm-ring">
                        <div class="endurance-ring-core">
                          <div class="endurance-gear" data-role="gear">N</div>
                          <div class="telemetry-note" data-role="drive-state">Standby</div>
                        </div>
                      </div>
                    </div>
                    <div class="endurance-status-row">
                      <div class="endurance-status-card">
                        <div class="telemetry-label">DNS</div>
                        <div class="grid-metric" data-role="dns-status">READY</div>
                      </div>
                      <div class="endurance-status-card">
                        <div class="telemetry-label">Diff Lock</div>
                        <div class="grid-metric" data-role="diff-lock">AUTO</div>
                      </div>
                      <div class="endurance-status-card">
                        <div class="telemetry-label">Shift Window</div>
                        <div class="grid-metric" data-role="window-value">7000-9000</div>
                      </div>
                    </div>
                  </article>

                  <aside class="endurance-side">
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Boost</div>
                      <div class="grid-metric"><span data-role="boost">0.0</span> psi</div>
                    </div>
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Voltage</div>
                      <div class="grid-metric"><span data-role="voltage">12.8</span> v</div>
                    </div>
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Oil Temp</div>
                      <div class="grid-metric"><span data-role="oil-temp">180</span>F</div>
                    </div>
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Water Temp</div>
                      <div class="grid-metric"><span data-role="water-temp">176</span>F</div>
                    </div>
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Oil Pressure</div>
                      <div class="grid-metric"><span data-role="oil-pressure">48</span> psi</div>
                    </div>
                    <div class="endurance-metric-card">
                      <div class="telemetry-label">Brake Bias</div>
                      <div class="grid-metric" data-role="brake-bias">58F</div>
                    </div>
                  </aside>
                </div>

                <div class="endurance-footer-strip">
                  <div class="band-chip" data-role="band-name">Idle</div>
                  <div class="band-percent" data-role="rpm-percent">0%</div>
                  <div class="telemetry-note" data-role="shift-status">Build RPM</div>
                </div>
                <div class="telemetry-hint-strip">Swipe down for Pro Drift view or left for Layout 1</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getGridContainerStyle(template) {
  return `grid-template-columns: repeat(${template.columns}, minmax(0, 1fr)); grid-template-rows: repeat(${template.rows}, minmax(0, 1fr));`;
}

function getGridSlotStyle(slot) {
  const styles = [];

  if (slot.colStart && slot.colSpan) {
    styles.push(`grid-column: ${slot.colStart} / span ${slot.colSpan};`);
  } else if (slot.colStart) {
    styles.push(`grid-column-start: ${slot.colStart};`);
  } else if (slot.colSpan) {
    styles.push(`grid-column: span ${slot.colSpan};`);
  }

  if (slot.rowStart && slot.rowSpan) {
    styles.push(`grid-row: ${slot.rowStart} / span ${slot.rowSpan};`);
  } else if (slot.rowStart) {
    styles.push(`grid-row-start: ${slot.rowStart};`);
  } else if (slot.rowSpan) {
    styles.push(`grid-row: span ${slot.rowSpan};`);
  }

  return styles.join(" ");
}

function getLayoutPickerMarkup() {
  const groupedLayouts = orderedLayoutEntries.reduce((groups, [layoutKey, template]) => {
    const buttonCount = template.slots.length;

    if (!groups[buttonCount]) {
      groups[buttonCount] = [];
    }

    groups[buttonCount].push([layoutKey, template]);
    return groups;
  }, {});

  const categoryMarkup = Object.entries(groupedLayouts).map(([buttonCount, layouts]) => `
    <section class="layout-category">
      <div class="layout-category-title">${buttonCount} Buttons</div>
      <div class="layout-category-grid">
        ${layouts.map(([layoutKey, template]) => `
          <button class="layout-option" type="button" data-layout="${layoutKey}">
            <div class="layout-option-title">${template.title}</div>
            <div class="layout-option-count">${buttonCount} control positions</div>
            <div class="layout-option-preview layout-preview-grid" style="${getGridContainerStyle(template)}">
              ${template.slots.map((slot) => `
                <span class="layout-slot" style="${getGridSlotStyle(slot)}"></span>
              `).join("")}
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");

  return `<div class="layout-picker hidden">${categoryMarkup}</div>`;
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

      <div class="palette-item" role="button" tabindex="0" data-component-type="rotary">
        <div class="palette-item-preview preview-rotary">
          <div class="control-face control-rotary-face">
            <div class="control-rotary-bezel"></div>
            <div class="control-rotary-knob">
              <div class="control-rotary-pointer"></div>
            </div>
          </div>
        </div>
        <div>
          <div class="palette-item-label">Rotary</div>
          <div class="palette-item-caption">Encoder CW / CCW</div>
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

        <section class="debug-drawer hidden">
          <button class="debug-drawer-toggle" type="button" aria-expanded="false">Show Debug</button>
          <div class="debug-drawer-panel hidden">
            <div class="output-monitor-label">Switch Event Debug</div>
            <div class="output-monitor-value">Nothing sent yet.</div>
            <div class="debug-log-list">
              <div class="debug-log-empty">No events yet.</div>
            </div>
          </div>
        </section>

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
  trackEl: document.getElementById("telemetry-track"),
  dots: Array.from(document.querySelectorAll(".telemetry-dot")),
  rpmEls: document.querySelectorAll('[data-role="rpm"]'),
  gearEls: document.querySelectorAll('[data-role="gear"]'),
  driveStateEls: document.querySelectorAll('[data-role="drive-state"]'),
  shiftStatusEls: document.querySelectorAll('[data-role="shift-status"]'),
  bandNameEls: document.querySelectorAll('[data-role="band-name"]'),
  rpmPercentEls: document.querySelectorAll('[data-role="rpm-percent"]'),
  windowValueEls: document.querySelectorAll('[data-role="window-value"]'),
  boostEls: document.querySelectorAll('[data-role="boost"]'),
  voltageEls: document.querySelectorAll('[data-role="voltage"]'),
  oilTempEls: document.querySelectorAll('[data-role="oil-temp"]'),
  waterTempEls: document.querySelectorAll('[data-role="water-temp"]'),
  oilPressureEls: document.querySelectorAll('[data-role="oil-pressure"]'),
  dnsStatusEls: document.querySelectorAll('[data-role="dns-status"]'),
  diffLockEls: document.querySelectorAll('[data-role="diff-lock"]'),
  brakeBiasEls: document.querySelectorAll('[data-role="brake-bias"]'),
  tachNeedleEls: document.querySelectorAll('[data-role="tach-needle"]'),
  driftRpmBarEls: document.querySelectorAll('[data-role="rpm-bar"]'),
  enduranceRingEls: document.querySelectorAll('[data-role="rpm-ring"]'),
  shiftLightGroups: Array.from(document.querySelectorAll('[data-role="shift-lights"]')).map((group) => group.querySelectorAll(".light")),
};

const layoutPages = Array.from(document.querySelectorAll(".button-box-page")).map((pageEl, index) => ({
  index,
  pageEl,
  state: {
    mode: "start",
    selectedLayout: null,
    placedComponents: {},
    componentStates: {},
    componentSettings: {},
    componentConfigs: {},
    lastOutput: "Nothing sent yet.",
    eventLog: [],
    debugPanelOpen: false,
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
    outputMonitorEl: pageEl.querySelector(".debug-drawer"),
    outputMonitorValueEl: pageEl.querySelector(".output-monitor-value"),
    debugDrawerToggleEl: pageEl.querySelector(".debug-drawer-toggle"),
    debugDrawerPanelEl: pageEl.querySelector(".debug-drawer-panel"),
    debugLogListEl: pageEl.querySelector(".debug-log-list"),
  },
}));

loadSavedLayoutState();

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

function setTextContent(elements, value) {
  elements.forEach((element) => {
    element.textContent = value;
  });
}

function getAuxTelemetryMetrics(rpmPercent, gear, bandName) {
  const t = performance.now() / 1000;
  const boost = (rpmPercent / 100) * 23 + Math.sin(t * 1.2) * 0.8;
  const voltage = 12.6 + (rpmPercent / 100) * 1.2 + Math.sin(t * 0.7) * 0.1;
  const oilTemp = 174 + rpmPercent * 0.44 + Math.sin(t * 0.5) * 2;
  const waterTemp = 168 + rpmPercent * 0.34 + Math.cos(t * 0.45) * 2;
  const oilPressure = 22 + rpmPercent * 0.56 + Math.sin(t * 0.85) * 1.4;
  const dnsStatus = rpmPercent > 80 ? "ATTACK" : rpmPercent > 45 ? "ARMED" : "READY";
  const diffLock = gear === "N" ? "OPEN" : rpmPercent > 72 ? "LOCK" : "AUTO";
  const brakeBias = `${Math.round(56 + (rpmPercent / 100) * 4)}F`;

  return {
    boost: boost.toFixed(1),
    voltage: voltage.toFixed(1),
    oilTemp: Math.round(oilTemp),
    waterTemp: Math.round(waterTemp),
    oilPressure: Math.round(oilPressure),
    dnsStatus,
    diffLock,
    brakeBias,
    bandName,
  };
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
  const rpmAngle = `${Math.max(-130, -130 + rpmPercent * 2.6)}deg`;
  const auxMetrics = getAuxTelemetryMetrics(rpmPercent, gear, bandName);

  setTextContent(telemetryRefs.gearEls, gear);
  setTextContent(telemetryRefs.rpmEls, rpm);
  setTextContent(telemetryRefs.driveStateEls, gear === "N" ? "Standby" : `Gear ${gear} engaged`);
  setTextContent(telemetryRefs.shiftStatusEls, shiftStatus);
  setTextContent(telemetryRefs.bandNameEls, bandName);
  setTextContent(telemetryRefs.rpmPercentEls, `${roundedRpmPercent}%`);
  setTextContent(telemetryRefs.windowValueEls, `${shiftThreshold}-${rpmMax}`);
  setTextContent(telemetryRefs.boostEls, auxMetrics.boost);
  setTextContent(telemetryRefs.voltageEls, auxMetrics.voltage);
  setTextContent(telemetryRefs.oilTempEls, auxMetrics.oilTemp);
  setTextContent(telemetryRefs.waterTempEls, auxMetrics.waterTemp);
  setTextContent(telemetryRefs.oilPressureEls, auxMetrics.oilPressure);
  setTextContent(telemetryRefs.dnsStatusEls, auxMetrics.dnsStatus);
  setTextContent(telemetryRefs.diffLockEls, auxMetrics.diffLock);
  setTextContent(telemetryRefs.brakeBiasEls, auxMetrics.brakeBias);

  telemetryRefs.tachNeedleEls.forEach((needle) => {
    needle.style.setProperty("--needle-angle", rpmAngle);
  });

  telemetryRefs.driftRpmBarEls.forEach((bar) => {
    bar.style.width = `${rpmPercent}%`;
  });

  telemetryRefs.enduranceRingEls.forEach((ring) => {
    ring.style.setProperty("--rpm-progress-angle", `${Math.max(18, rpmPercent * 2.8)}deg`);
  });

  telemetryRefs.shiftLightGroups.forEach((lights) => {
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

function setTelemetryPage(pageIndex) {
  currentTelemetryPage = Math.max(0, Math.min(TOTAL_TELEMETRY_PAGES - 1, pageIndex));
  telemetryRefs.trackEl.style.transform = `translateY(-${currentTelemetryPage * 100}%)`;

  telemetryRefs.dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentTelemetryPage);
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

function handleTelemetrySwipe(deltaY) {
  if (Math.abs(deltaY) < 50) {
    return;
  }

  if (deltaY < 0) {
    setTelemetryPage(currentTelemetryPage + 1);
  } else {
    setTelemetryPage(currentTelemetryPage - 1);
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
    case "rotary":
      return `
        <div class="control-face control-rotary-face">
          <div class="control-rotary-bezel"></div>
          <div class="control-rotary-knob">
            <div class="control-rotary-pointer"></div>
          </div>
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

function getComponentSettings(page, slotId, componentType) {
  const savedSettings = page.state.componentSettings[slotId] ?? {};

  if (componentType === "toggle") {
    return {
      orientation: savedSettings.orientation === "horizontal" ? "horizontal" : "vertical",
    };
  }

  return savedSettings;
}

function getComponentConfig(page, slotId, componentType) {
  const savedConfig = page.state.componentConfigs[slotId] ?? {};

  return {
    name: savedConfig.name ?? "",
    outputPress: savedConfig.outputPress ?? "",
    outputRelease: savedConfig.outputRelease ?? "",
    outputOn: savedConfig.outputOn ?? "",
    outputOff: savedConfig.outputOff ?? "",
    buttonMode: savedConfig.buttonMode === "latched" ? "latched" : "momentary",
    ledColor: BUTTON_LED_THEMES[savedConfig.ledColor] ? savedConfig.ledColor : "red",
    buttonNumber: Number.isInteger(savedConfig.buttonNumber) && savedConfig.buttonNumber > 0 ? savedConfig.buttonNumber : null,
    cwButtonNumber: Number.isInteger(savedConfig.cwButtonNumber) && savedConfig.cwButtonNumber > 0 ? savedConfig.cwButtonNumber : null,
    ccwButtonNumber: Number.isInteger(savedConfig.ccwButtonNumber) && savedConfig.ccwButtonNumber > 0 ? savedConfig.ccwButtonNumber : null,
    signalMode: savedConfig.signalMode === "state" ? "state" : "pulse",
    componentType,
  };
}

function parseButtonCommand(command) {
  const match = String(command || "").trim().match(/^BTN(?::)?(\d+)(?::([A-Z+\-]+)(?::(\d+))?)?$/i);

  if (!match) {
    return null;
  }

  return {
    buttonNumber: Number.parseInt(match[1], 10),
    action: (match[2] ?? "").toUpperCase(),
    durationMs: match[3] ? Number.parseInt(match[3], 10) : null,
  };
}

function inferButtonPickerConfig(componentType, config) {
  if (componentType === "rotary") {
    const pressCommand = parseButtonCommand(config.outputPress);
    const releaseCommand = parseButtonCommand(config.outputRelease);

    if (
      pressCommand
      && releaseCommand
      && pressCommand.buttonNumber > 0
      && releaseCommand.buttonNumber === pressCommand.buttonNumber + 1
      && ["+", "CW", "TAP"].includes(pressCommand.action || "+")
      && ["-", "CCW", "TAP"].includes(releaseCommand.action || "-")
    ) {
      return {
        buttonNumber: pressCommand.buttonNumber,
        cwButtonNumber: pressCommand.buttonNumber,
        ccwButtonNumber: releaseCommand.buttonNumber,
        signalMode: "pulse",
      };
    }

    if (
      pressCommand
      && releaseCommand
      && pressCommand.buttonNumber > 0
      && releaseCommand.buttonNumber > 0
      && ["+", "CW", "TAP"].includes(pressCommand.action || "+")
      && ["-", "CCW", "TAP"].includes(releaseCommand.action || "-")
    ) {
      return {
        buttonNumber: pressCommand.buttonNumber,
        cwButtonNumber: pressCommand.buttonNumber,
        ccwButtonNumber: releaseCommand.buttonNumber,
        signalMode: "pulse",
      };
    }
  }

  if (componentType === "button" && config.buttonMode === "momentary") {
    const pressCommand = parseButtonCommand(config.outputPress);
    const releaseCommand = parseButtonCommand(config.outputRelease);

    if (
      pressCommand
      && releaseCommand
      && pressCommand.buttonNumber === releaseCommand.buttonNumber
      && (pressCommand.action === "DOWN" || pressCommand.action === "")
      && (releaseCommand.action === "UP" || releaseCommand.action === "")
    ) {
      return { buttonNumber: pressCommand.buttonNumber, signalMode: "state" };
    }
  }

  const onCommand = parseButtonCommand(config.outputOn);
  const offCommand = parseButtonCommand(config.outputOff);

  if (onCommand && offCommand && onCommand.buttonNumber === offCommand.buttonNumber) {
    const stateMode = onCommand.action === "ON" && offCommand.action === "OFF";
    const pulseMode = onCommand.action === "TAP" && offCommand.action === "TAP";
    const legacySameButton = !onCommand.action && !offCommand.action;

    if (stateMode || pulseMode || legacySameButton) {
      return {
        buttonNumber: onCommand.buttonNumber,
        signalMode: stateMode ? "state" : "pulse",
      };
    }
  }

  return { buttonNumber: null, signalMode: "pulse" };
}

function componentSupportsSignalMode(componentType, config) {
  return ["toggle", "rocker", "start"].includes(componentType) || (componentType === "button" && config.buttonMode === "latched");
}

function buildAutoOutputMap(componentType, config) {
  const buttonNumber = Number.parseInt(config.buttonNumber, 10);

  if (componentType === "rotary") {
    const cwButtonNumber = Number.parseInt(config.cwButtonNumber, 10);
    const ccwButtonNumber = Number.parseInt(config.ccwButtonNumber, 10);
    const resolvedCwButtonNumber = Number.isInteger(cwButtonNumber) && cwButtonNumber > 0
      ? cwButtonNumber
      : (Number.isInteger(buttonNumber) && buttonNumber > 0 ? buttonNumber : null);
    const resolvedCcwButtonNumber = Number.isInteger(ccwButtonNumber) && ccwButtonNumber > 0
      ? ccwButtonNumber
      : (resolvedCwButtonNumber ? resolvedCwButtonNumber + 1 : null);

    if (!resolvedCwButtonNumber || !resolvedCcwButtonNumber) {
      return null;
    }

    return {
      outputPress: `BTN:${resolvedCwButtonNumber}:TAP`,
      outputRelease: `BTN:${resolvedCcwButtonNumber}:TAP`,
    };
  }

  if (!Number.isInteger(buttonNumber) || buttonNumber < 1) {
    return null;
  }

  if (componentType === "button" && config.buttonMode === "momentary") {
    return {
      outputPress: `BTN:${buttonNumber}:DOWN`,
      outputRelease: `BTN:${buttonNumber}:UP`,
    };
  }

  if (componentType === "light") {
    return {
      outputPress: `BTN:${buttonNumber}:DOWN`,
      outputRelease: `BTN:${buttonNumber}:UP`,
    };
  }

  if (componentSupportsSignalMode(componentType, config)) {
    const pulseCommand = `BTN:${buttonNumber}:TAP`;

    if (config.signalMode === "state") {
      return {
        outputOn: `BTN:${buttonNumber}:ON`,
        outputOff: `BTN:${buttonNumber}:OFF`,
      };
    }

    return {
      outputOn: pulseCommand,
      outputOff: pulseCommand,
    };
  }

  return null;
}

function resolveConfiguredOutput(componentType, config, outputType) {
  const autoOutputMap = buildAutoOutputMap(componentType, config);

  if (autoOutputMap && autoOutputMap[outputType]) {
    return autoOutputMap[outputType];
  }

  if (componentType === "rocker" && (outputType === "on" || outputType === "off")) {
    const onCommand = parseButtonCommand(config.outputOn);
    const offCommand = parseButtonCommand(config.outputOff);

    if (
      onCommand
      && offCommand
      && onCommand.buttonNumber === offCommand.buttonNumber
      && (
        (!onCommand.action && !offCommand.action)
        || (onCommand.action === "ON" && offCommand.action === "OFF")
      )
    ) {
      return `BTN:${onCommand.buttonNumber}:TAP`;
    }
  }

  const outputMap = {
    press: config.outputPress,
    release: config.outputRelease,
    cw: config.outputPress,
    ccw: config.outputRelease,
    on: config.outputOn,
    off: config.outputOff,
  };

  return (outputMap[outputType] ?? "").trim();
}

function getControlLabel(page, slotId, componentType) {
  const component = componentCatalog[componentType] ?? componentCatalog.button;
  const config = getComponentConfig(page, slotId, componentType);

  return config.name.trim() || component.label;
}

function getButtonTheme(colorName) {
  return BUTTON_LED_THEMES[colorName] ?? BUTTON_LED_THEMES.red;
}

function getControlStyleAttribute(componentType, config) {
  if (componentType !== "button") {
    return "";
  }

  const theme = getButtonTheme(config.ledColor);
  return ` style="--control-accent-bright: ${theme.bright}; --control-accent: ${theme.base}; --control-accent-shadow: ${theme.shadow}; --control-accent-glow: ${theme.glow}; --control-accent-soft: ${theme.soft};"`;
}

function controlUsesToggleOutputs(componentType, config) {
  if (componentType === "button") {
    return config.buttonMode === "latched";
  }

  return ["toggle", "start", "rocker"].includes(componentType);
}

function updateControlConfigFieldVisibility() {
  if (!controlConfigTarget) {
    return;
  }

  const componentType = controlConfigTarget.componentType;
  const draftConfig = {
    buttonMode: controlConfigButtonModeEl.value || "momentary",
    signalMode: controlConfigSignalModeEl.value === "state" ? "state" : "pulse",
  };
  const usesToggleOutputs = controlUsesToggleOutputs(componentType, draftConfig);
  const isButton = componentType === "button";
  const isRotary = componentType === "rotary";
  const supportsSignalMode = componentSupportsSignalMode(componentType, draftConfig);

  controlConfigButtonNumberFieldEl.classList.toggle("hidden", isRotary);
  controlConfigEncoderCwButtonNumberFieldEl.classList.toggle("hidden", !isRotary);
  controlConfigEncoderCcwButtonNumberFieldEl.classList.toggle("hidden", !isRotary);
  controlConfigSignalModeFieldEl.classList.toggle("hidden", !supportsSignalMode || isRotary);
  controlConfigButtonModeFieldEl.classList.toggle("hidden", !isButton);
  controlConfigColorFieldEl.classList.toggle("hidden", !isButton);
  controlConfigPressFieldEl.classList.toggle("hidden", usesToggleOutputs);
  controlConfigReleaseFieldEl.classList.toggle("hidden", usesToggleOutputs);
  controlConfigOnFieldEl.classList.toggle("hidden", !usesToggleOutputs);
  controlConfigOffFieldEl.classList.toggle("hidden", !usesToggleOutputs);

  controlConfigButtonNumberLabelEl.textContent = isRotary ? "Encoder Base Button #" : "VJoy Button #";
  controlConfigPressLabelEl.textContent = isRotary ? "Clockwise Output" : "Pressed Output";
  controlConfigReleaseLabelEl.textContent = isRotary ? "Counter-Clockwise Output" : "Released Output";
  controlConfigOnLabelEl.textContent = "On Output";
  controlConfigOffLabelEl.textContent = "Off Output";
  controlConfigButtonNumberEl.placeholder = isRotary ? "6" : "13";
  controlConfigEncoderCwButtonNumberEl.placeholder = "6";
  controlConfigEncoderCcwButtonNumberEl.placeholder = "7";
  controlConfigOutputPressEl.placeholder = isRotary ? "BTN6:+" : "BTN:13";
  controlConfigOutputReleaseEl.placeholder = isRotary ? "BTN6:-" : "BTN:13:UP";
  controlConfigOutputOnEl.placeholder = supportsSignalMode ? "BTN:13:TAP" : "SW:IGNITION:ON";
  controlConfigOutputOffEl.placeholder = supportsSignalMode ? "BTN:13:TAP" : "SW:IGNITION:OFF";
}

function getSlotControlMarkup(componentType, slotId, isActive = false, options = {}) {
  const activeClass = isActive ? " is-active" : "";
  const orientationClass = options.orientation === "horizontal" ? " is-horizontal" : "";
  const rotateButtonMarkup = options.showRotateButton
    ? `<button class="control-rotate-button" type="button" data-rotate-slot-id="${slotId}">Rotate</button>`
    : "";
  const editButtonMarkup = options.showEditButton
    ? `<button class="control-edit-button" type="button" data-edit-slot-id="${slotId}">Edit</button>`
    : "";
  const controlLabel = options.controlLabel ?? (componentCatalog[componentType] ?? componentCatalog.button).label;
  const controlStyleAttribute = options.controlStyleAttribute ?? "";

  if (componentType === "start") {
    return `
      <div class="slot-filled-button slot-filled-button-start${activeClass}" data-component-type="${componentType}" data-slot-id="${slotId}">
        ${editButtonMarkup}
        <div class="slot-control-visual">
          <div class="start-stack">
            <div class="start-status-light${activeClass}"></div>
            ${getControlVisualMarkup(componentType)}
          </div>
        </div>
        <div class="slot-control-label">${controlLabel}</div>
      </div>
    `;
  }

  if (componentType === "toggle") {
    return `
      <div class="slot-filled-button slot-filled-button-toggle${activeClass}${orientationClass}" data-component-type="${componentType}" data-slot-id="${slotId}">
        ${editButtonMarkup}
        ${rotateButtonMarkup}
        <div class="slot-control-visual">
          ${getControlVisualMarkup(componentType)}
        </div>
        <div class="slot-control-label">${controlLabel}</div>
      </div>
    `;
  }

  if (componentType === "rocker") {
    return `
      <div class="slot-filled-button slot-filled-button-rocker${activeClass}" data-component-type="${componentType}" data-slot-id="${slotId}">
        ${editButtonMarkup}
        <div class="slot-control-visual">
          <div class="rocker-stack">
            <div class="rocker-pedestal"></div>
            ${getControlVisualMarkup(componentType)}
          </div>
        </div>
        <div class="slot-control-label">${controlLabel}</div>
      </div>
    `;
  }

  if (componentType === "rotary") {
    return `
      <div class="slot-filled-button slot-filled-button-rotary" data-component-type="${componentType}" data-slot-id="${slotId}">
        ${editButtonMarkup}
        <div class="slot-control-visual">
          <div class="rotary-stack">
            <div class="rotary-panel"></div>
            ${getControlVisualMarkup(componentType)}
          </div>
        </div>
        <div class="slot-control-label">${controlLabel}</div>
      </div>
    `;
  }

  if (componentType === "button") {
    return `
      <div class="slot-filled-button slot-filled-button-push${activeClass}" data-component-type="${componentType}" data-slot-id="${slotId}"${controlStyleAttribute}>
        ${editButtonMarkup}
        <div class="slot-control-visual">
          <div class="push-button-stack">
            <div class="push-button-panel"></div>
            ${getControlVisualMarkup(componentType)}
          </div>
        </div>
        <div class="slot-control-label">${controlLabel}</div>
      </div>
    `;
  }

  return `
    <div class="slot-filled-button" data-component-type="${componentType}" data-slot-id="${slotId}">
      ${editButtonMarkup}
      <div class="slot-control-visual">
        ${getControlVisualMarkup(componentType)}
      </div>
      <div class="slot-control-label">${controlLabel}</div>
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

  refs.layoutCanvasEl.className = "layout-canvas";
  refs.layoutCanvasEl.style.cssText = getGridContainerStyle(template);
  refs.layoutCanvasEl.innerHTML = template.slots.map((slot) => {
    const componentType = state.placedComponents[slot.id];
    const slotStyle = getGridSlotStyle(slot);

    if (componentType) {
      const isActive = Boolean(state.componentStates[slot.id]);
      const componentSettings = getComponentSettings(page, slot.id, componentType);
      const componentConfig = getComponentConfig(page, slot.id, componentType);
      const controlLabel = getControlLabel(page, slot.id, componentType);
      return `
        <div class="drop-slot filled" data-slot-id="${slot.id}" style="${slotStyle}">
          ${getSlotControlMarkup(componentType, slot.id, isActive, {
            orientation: componentSettings.orientation,
            showRotateButton: state.mode === "builder" && componentType === "toggle",
            showEditButton: state.mode === "builder",
            controlLabel,
            controlStyleAttribute: getControlStyleAttribute(componentType, componentConfig),
          })}
        </div>
      `;
    }

    const modeClass = state.mode === "live" ? " view-only" : "";
    return `<div class="drop-slot${modeClass}" data-slot-id="${slot.id}" style="${slotStyle}"></div>`;
  }).join("");
}

function renderLayoutPage(page) {
  const { state, refs } = page;

  refs.layoutEmptyStateEl.classList.toggle("hidden", state.mode !== "start");
  refs.layoutPickerEl.classList.toggle("hidden", state.mode !== "picker");
  refs.layoutBuilderEl.classList.toggle("hidden", state.mode !== "builder" && state.mode !== "live");
  refs.layoutBuilderEl.classList.toggle("live-mode", state.mode === "live");
  refs.outputMonitorEl.classList.toggle("hidden", !state.selectedLayout);
  refs.outputMonitorValueEl.textContent = state.lastOutput;
  refs.debugDrawerPanelEl.classList.toggle("hidden", !state.debugPanelOpen);
  refs.debugDrawerToggleEl.setAttribute("aria-expanded", String(state.debugPanelOpen));
  refs.debugDrawerToggleEl.textContent = state.debugPanelOpen ? "Hide Debug" : "Show Debug";
  refs.debugLogListEl.innerHTML = state.eventLog.length
    ? state.eventLog.map((entry) => `
      <div class="debug-log-entry">
        <span class="debug-log-time">${entry.time}</span>
        <span class="debug-log-text">${entry.text}</span>
      </div>
    `).join("")
    : '<div class="debug-log-empty">No events yet.</div>';

  if (state.selectedLayout) {
    refs.builderLayoutTitleEl.textContent = layoutTemplates[state.selectedLayout].title;
    renderLayoutCanvas(page);
  } else {
    refs.layoutCanvasEl.innerHTML = "";
  }
}

function persistLayoutState() {
  try {
    const snapshot = layoutPages.map((page) => ({
      mode: page.state.mode,
      selectedLayout: page.state.selectedLayout,
      placedComponents: page.state.placedComponents,
      componentStates: page.state.componentStates,
      componentSettings: page.state.componentSettings,
      componentConfigs: page.state.componentConfigs,
      eventLog: page.state.eventLog,
      debugPanelOpen: page.state.debugPanelOpen,
    }));

    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.error("Unable to save layout state:", error);
  }
}

function loadSavedLayoutState() {
  try {
    const rawValue = window.localStorage.getItem(LAYOUT_STORAGE_KEY);

    if (!rawValue) {
      return;
    }

    const savedPages = JSON.parse(rawValue);

    if (!Array.isArray(savedPages)) {
      return;
    }

    savedPages.forEach((savedState, index) => {
      const page = layoutPages[index];

      if (!page || typeof savedState !== "object" || savedState === null) {
        return;
      }

      page.state.mode = savedState.mode ?? page.state.mode;
      page.state.selectedLayout = savedState.selectedLayout ?? null;
      page.state.placedComponents = savedState.placedComponents ?? {};
      page.state.componentStates = savedState.componentStates ?? {};
      page.state.componentSettings = savedState.componentSettings ?? {};
      page.state.componentConfigs = savedState.componentConfigs ?? {};
      page.state.eventLog = Array.isArray(savedState.eventLog) ? savedState.eventLog : [];
      page.state.debugPanelOpen = Boolean(savedState.debugPanelOpen);
    });
  } catch (error) {
    console.error("Unable to load saved layout state:", error);
  }
}

function closeControlConfig() {
  controlConfigTarget = null;
  controlConfigModalEl.classList.add("hidden");
}

function openControlConfig(page, slotId) {
  const componentType = page.state.placedComponents[slotId];

  if (!componentType) {
    return;
  }

  const config = getComponentConfig(page, slotId, componentType);
  const defaultLabel = (componentCatalog[componentType] ?? componentCatalog.button).label;
  const isRotary = componentType === "rotary";
  const inferredPickerConfig = inferButtonPickerConfig(componentType, config);

  controlConfigTarget = { page, slotId, componentType };
  controlConfigTitleEl.textContent = `Edit ${defaultLabel}`;
  controlConfigCopyEl.textContent = isRotary
    ? "Set the visible label plus the clockwise and counter-clockwise outputs this encoder should send."
    : "Set the visible label and the output strings this control should send in live mode.";
  controlConfigNameEl.value = config.name;
  controlConfigButtonNumberEl.value = config.buttonNumber ?? inferredPickerConfig.buttonNumber ?? "";
  controlConfigEncoderCwButtonNumberEl.value = config.cwButtonNumber ?? inferredPickerConfig.cwButtonNumber ?? "";
  controlConfigEncoderCcwButtonNumberEl.value = config.ccwButtonNumber ?? inferredPickerConfig.ccwButtonNumber ?? "";
  controlConfigSignalModeEl.value = config.buttonNumber ? config.signalMode : (inferredPickerConfig.signalMode ?? "pulse");
  controlConfigButtonModeEl.value = config.buttonMode;
  controlConfigColorEl.value = config.ledColor;
  controlConfigOutputPressEl.value = config.outputPress;
  controlConfigOutputReleaseEl.value = config.outputRelease;
  controlConfigOutputOnEl.value = config.outputOn;
  controlConfigOutputOffEl.value = config.outputOff;
  updateControlConfigFieldVisibility();
  controlConfigModalEl.classList.remove("hidden");
  controlConfigNameEl.focus();
}

function saveControlConfig() {
  if (!controlConfigTarget) {
    return;
  }

  const { page, slotId, componentType } = controlConfigTarget;
  const nextConfig = {
    ...getComponentConfig(page, slotId, componentType),
    name: controlConfigNameEl.value.trim(),
    outputPress: controlConfigOutputPressEl.value.trim(),
    outputRelease: controlConfigOutputReleaseEl.value.trim(),
    outputOn: controlConfigOutputOnEl.value.trim(),
    outputOff: controlConfigOutputOffEl.value.trim(),
    buttonMode: controlConfigButtonModeEl.value === "latched" ? "latched" : "momentary",
    ledColor: BUTTON_LED_THEMES[controlConfigColorEl.value] ? controlConfigColorEl.value : "red",
    buttonNumber: Number.isInteger(Number.parseInt(controlConfigButtonNumberEl.value, 10))
      && Number.parseInt(controlConfigButtonNumberEl.value, 10) > 0
      ? Number.parseInt(controlConfigButtonNumberEl.value, 10)
      : null,
    cwButtonNumber: Number.isInteger(Number.parseInt(controlConfigEncoderCwButtonNumberEl.value, 10))
      && Number.parseInt(controlConfigEncoderCwButtonNumberEl.value, 10) > 0
      ? Number.parseInt(controlConfigEncoderCwButtonNumberEl.value, 10)
      : null,
    ccwButtonNumber: Number.isInteger(Number.parseInt(controlConfigEncoderCcwButtonNumberEl.value, 10))
      && Number.parseInt(controlConfigEncoderCcwButtonNumberEl.value, 10) > 0
      ? Number.parseInt(controlConfigEncoderCcwButtonNumberEl.value, 10)
      : null,
    signalMode: controlConfigSignalModeEl.value === "state" ? "state" : "pulse",
  };

  const autoOutputMap = buildAutoOutputMap(componentType, nextConfig);

  if (autoOutputMap) {
    nextConfig.outputPress = autoOutputMap.outputPress ?? nextConfig.outputPress;
    nextConfig.outputRelease = autoOutputMap.outputRelease ?? nextConfig.outputRelease;
    nextConfig.outputOn = autoOutputMap.outputOn ?? nextConfig.outputOn;
    nextConfig.outputOff = autoOutputMap.outputOff ?? nextConfig.outputOff;
  }

  page.state.componentConfigs[slotId] = nextConfig;

  if (componentType === "button" && page.state.componentConfigs[slotId].buttonMode === "momentary") {
    page.state.componentStates[slotId] = false;
  }

  renderLayoutPage(page);
  persistLayoutState();
  closeControlConfig();
}

async function emitControlOutput(page, slotId, outputType, componentType) {
  const config = getComponentConfig(page, slotId, componentType);
  const controlName = getControlLabel(page, slotId, componentType);
  const output = resolveConfiguredOutput(componentType, config, outputType);
  const timestamp = new Date();
  const displayTime = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  page.state.lastOutput = output
    ? `${controlName}: ${output}`
    : `${controlName}: no output mapped for ${outputType}`;
  page.state.eventLog = [
    {
      time: displayTime,
      text: page.state.lastOutput,
    },
    ...page.state.eventLog,
  ].slice(0, 20);
  page.refs.outputMonitorValueEl.textContent = page.state.lastOutput;
  page.refs.debugLogListEl.innerHTML = page.state.eventLog.map((entry) => `
    <div class="debug-log-entry">
      <span class="debug-log-time">${entry.time}</span>
      <span class="debug-log-text">${entry.text}</span>
    </div>
  `).join("");
  persistLayoutState();

  if (!output) {
    return;
  }

  const payload = {
    page: page.index + 1,
    slotId,
    componentType,
    controlName,
    outputType,
    output,
    timestamp: timestamp.toISOString(),
  };

  try {
    const response = await fetch("/api/control-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();

    const backendName = responseData.output_status?.backend ?? "controller";

    if (output && responseData.dispatched) {
      page.state.lastOutput = `${controlName}: ${output} -> ${backendName}`;
    } else if (output && !responseData.dispatched) {
      const detail = responseData.dispatch_detail ? ` (${responseData.dispatch_detail})` : "";
      page.state.lastOutput = `${controlName}: ${output} -> local only${detail}`;
    }

    page.state.eventLog[0] = {
      time: displayTime,
      text: page.state.lastOutput,
    };
    page.refs.outputMonitorValueEl.textContent = page.state.lastOutput;
    page.refs.debugLogListEl.innerHTML = page.state.eventLog.map((entry) => `
      <div class="debug-log-entry">
        <span class="debug-log-time">${entry.time}</span>
        <span class="debug-log-text">${entry.text}</span>
      </div>
    `).join("");
    persistLayoutState();
    console.info("Control output sent:", payload, responseData);
  } catch (error) {
    console.error("Control output dispatch failed:", error);
    page.state.lastOutput = `${controlName}: ${output} (dispatch failed)`;
    page.refs.outputMonitorValueEl.textContent = page.state.lastOutput;
    page.state.eventLog = [
      {
        time: displayTime,
        text: page.state.lastOutput,
      },
      ...page.state.eventLog.filter((entry, index) => index !== 0),
    ].slice(0, 20);
    page.refs.debugLogListEl.innerHTML = page.state.eventLog.map((entry) => `
      <div class="debug-log-entry">
        <span class="debug-log-time">${entry.time}</span>
        <span class="debug-log-text">${entry.text}</span>
      </div>
    `).join("");
    persistLayoutState();
  }
}

function openLayoutPicker(page) {
  page.state.mode = "picker";
  renderLayoutPage(page);
  closeDeleteConfirm();
  closeControlConfig();
}

function openLayoutBuilder(page, layoutKey) {
  if (!layoutTemplates[layoutKey]) {
    return;
  }

  page.state.selectedLayout = layoutKey;
  page.state.placedComponents = {};
  page.state.componentStates = {};
  page.state.componentSettings = {};
  page.state.componentConfigs = {};
  page.state.lastOutput = "Nothing sent yet.";
  page.state.eventLog = [];
  page.state.debugPanelOpen = false;
  page.state.mode = "builder";
  renderLayoutPage(page);
  closeControlConfig();
  persistLayoutState();
}

function resetLayoutFlow(page) {
  page.state.mode = page.state.selectedLayout ? "builder" : "picker";
  renderLayoutPage(page);
  closeDeleteConfirm();
  closeControlConfig();
  closeAllMenus();
}

function finalizeCurrentLayout(page) {
  if (!page.state.selectedLayout) {
    return;
  }

  page.state.mode = "live";
  renderLayoutPage(page);
  closeControlConfig();
  persistLayoutState();
}

function resetToCreateLayout(page) {
  page.state.selectedLayout = null;
  page.state.placedComponents = {};
  page.state.componentStates = {};
  page.state.componentSettings = {};
  page.state.componentConfigs = {};
  page.state.lastOutput = "Nothing sent yet.";
  page.state.eventLog = [];
  page.state.debugPanelOpen = false;
  page.state.mode = "start";
  renderLayoutPage(page);
  closeControlConfig();
  persistLayoutState();
}

function shouldIgnoreSwipeTarget(target) {
  return Boolean(
    target.closest(".menu-wrap, .layout-option, .create-layout-button, .palette-item, .drop-slot, .slot-filled-button, .component-sidebar, .component-dropzone, .builder-submit-button, .confirm-dialog, .control-config-dialog, .control-edit-button, .control-rotate-button, .debug-drawer"),
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
    delete activeDrag.currentPage.state.componentStates[activeDrag.currentSlotId];
    activeDrag.currentPage.state.placedComponents[activeDrag.currentSlotId] = activeDrag.componentType;
    activeDrag.currentPage.state.componentSettings[activeDrag.currentSlotId] = { ...activeDrag.originSettings };
    activeDrag.currentPage.state.componentConfigs[activeDrag.currentSlotId] = activeDrag.originPage && activeDrag.originSlotId
      ? { ...(activeDrag.originPage.state.componentConfigs[activeDrag.originSlotId] ?? {}) }
      : {};

    if (
      activeDrag.originPage
      && activeDrag.originSlotId
      && (activeDrag.originPage !== activeDrag.currentPage || activeDrag.originSlotId !== activeDrag.currentSlotId)
    ) {
      delete activeDrag.originPage.state.placedComponents[activeDrag.originSlotId];
      delete activeDrag.originPage.state.componentSettings[activeDrag.originSlotId];
      delete activeDrag.originPage.state.componentStates[activeDrag.originSlotId];
      delete activeDrag.originPage.state.componentConfigs[activeDrag.originSlotId];
      renderLayoutPage(activeDrag.originPage);
    }

    renderLayoutPage(activeDrag.currentPage);
    persistLayoutState();
  } else if (activeDrag.overTray && activeDrag.originPage && activeDrag.originSlotId) {
    delete activeDrag.originPage.state.placedComponents[activeDrag.originSlotId];
    delete activeDrag.originPage.state.componentSettings[activeDrag.originSlotId];
    delete activeDrag.originPage.state.componentStates[activeDrag.originSlotId];
    delete activeDrag.originPage.state.componentConfigs[activeDrag.originSlotId];
    renderLayoutPage(activeDrag.originPage);
    persistLayoutState();
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
    originSettings: originPage && originSlotId ? { ...(originPage.state.componentSettings[originSlotId] ?? {}) } : {},
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

  if (filledControl.dataset.componentType === "start") {
    const slotId = filledControl.dataset.slotId;
    const nextState = !page.state.componentStates[slotId];
    page.state.componentStates[slotId] = nextState;
    renderLayoutPage(page);
    persistLayoutState();
    emitControlOutput(page, slotId, nextState ? "on" : "off", "start");
    pressedLiveControl = null;
    return;
  }

  if (filledControl.dataset.componentType === "rocker") {
    const slotId = filledControl.dataset.slotId;
    const nextState = !page.state.componentStates[slotId];
    page.state.componentStates[slotId] = nextState;
    renderLayoutPage(page);
    persistLayoutState();
    emitControlOutput(page, slotId, nextState ? "on" : "off", "rocker");
    pressedLiveControl = null;
    return;
  }

  if (filledControl.dataset.componentType === "rotary") {
    liveRotaryGesture = {
      page,
      slotId: filledControl.dataset.slotId,
      startX: event.clientX,
      startY: event.clientY,
      controlEl: filledControl,
    };
    pressedLiveControl = null;
    return;
  }

  if (filledControl.dataset.componentType === "button") {
    const slotId = filledControl.dataset.slotId;
    const config = getComponentConfig(page, slotId, "button");

    if (config.buttonMode === "latched") {
      const nextState = !page.state.componentStates[slotId];
      page.state.componentStates[slotId] = nextState;
      renderLayoutPage(page);
      persistLayoutState();
      emitControlOutput(page, slotId, nextState ? "on" : "off", "button");
      pressedLiveControl = null;
      return;
    }

    pressedLiveControl.classList.add("pressed");
    emitControlOutput(page, slotId, "press", "button");
    return;
  }

  if (filledControl.dataset.componentType === "toggle") {
    liveToggleGesture = {
      page,
      slotId: filledControl.dataset.slotId,
      startX: event.clientX,
      startY: event.clientY,
    };
    pressedLiveControl.classList.add("pressed");
    return;
  }

  pressedLiveControl.classList.add("pressed");

  if (filledControl.dataset.componentType === "light") {
    emitControlOutput(page, filledControl.dataset.slotId, "press", filledControl.dataset.componentType);
  }
}

function animateRotaryInteraction(controlEl, direction) {
  if (!controlEl) {
    return;
  }

  const cwClass = "pulse-cw";
  const ccwClass = "pulse-ccw";
  const activeClass = direction === "cw" ? cwClass : ccwClass;

  controlEl.classList.remove(cwClass, ccwClass);
  void controlEl.offsetWidth;
  controlEl.classList.add(activeClass);

  window.setTimeout(() => {
    controlEl.classList.remove(activeClass);
  }, 180);
}

function clearLiveControlPress(event) {
  if (liveRotaryGesture && event?.type === "pointerup") {
    const deltaX = event.clientX - liveRotaryGesture.startX;
    const deltaY = event.clientY - liveRotaryGesture.startY;
    const isTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;
    const isSwipe = Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY);
    let direction = null;

    if (isSwipe) {
      direction = deltaX > 0 ? "cw" : "ccw";
    } else if (isTap) {
      const rect = liveRotaryGesture.controlEl.getBoundingClientRect();
      direction = event.clientX >= rect.left + rect.width / 2 ? "cw" : "ccw";
    }

    if (direction) {
      animateRotaryInteraction(liveRotaryGesture.controlEl, direction);
      emitControlOutput(liveRotaryGesture.page, liveRotaryGesture.slotId, direction, "rotary");
    }
  }

  liveRotaryGesture = null;

  if (liveToggleGesture && event?.type === "pointerup") {
    const deltaX = event.clientX - liveToggleGesture.startX;
    const deltaY = event.clientY - liveToggleGesture.startY;
    const isTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;
    const isSwipeUp = deltaY < -20 && Math.abs(deltaY) > Math.abs(deltaX);

    if (isTap || isSwipeUp) {
      const nextState = !liveToggleGesture.page.state.componentStates[liveToggleGesture.slotId];
      liveToggleGesture.page.state.componentStates[liveToggleGesture.slotId] = nextState;
      renderLayoutPage(liveToggleGesture.page);
      persistLayoutState();
      emitControlOutput(liveToggleGesture.page, liveToggleGesture.slotId, nextState ? "on" : "off", "toggle");
    }
  }

  liveToggleGesture = null;

  if (!pressedLiveControl) {
    return;
  }

  if (
    event?.type === "pointerup"
    && (pressedLiveControl.dataset.componentType === "button" || pressedLiveControl.dataset.componentType === "light")
  ) {
    const pageEl = pressedLiveControl.closest(".button-box-page");
    const page = layoutPages.find((item) => item.pageEl === pageEl);

    if (page) {
      emitControlOutput(page, pressedLiveControl.dataset.slotId, "release", pressedLiveControl.dataset.componentType);
    }
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
  refs.debugDrawerToggleEl.addEventListener("click", () => {
    page.state.debugPanelOpen = !page.state.debugPanelOpen;
    renderLayoutPage(page);
    persistLayoutState();
  });

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
      const editButton = event.target.closest(".control-edit-button");

      if (editButton) {
        event.preventDefault();
        event.stopPropagation();
        openControlConfig(page, editButton.dataset.editSlotId);
        return;
      }

      const rotateButton = event.target.closest(".control-rotate-button");

      if (rotateButton) {
        event.preventDefault();
        event.stopPropagation();
        const slotId = rotateButton.dataset.rotateSlotId;
        const currentSettings = getComponentSettings(page, slotId, "toggle");
        page.state.componentSettings[slotId] = {
          ...currentSettings,
          orientation: currentSettings.orientation === "horizontal" ? "vertical" : "horizontal",
        };
        renderLayoutPage(page);
        persistLayoutState();
        return;
      }

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
  refs.layoutCanvasEl.addEventListener("pointerleave", () => {
    liveRotaryGesture = null;
    liveToggleGesture = null;
    clearLiveControlPress();
  });
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
controlConfigSaveEl.addEventListener("click", saveControlConfig);
controlConfigCancelEl.addEventListener("click", closeControlConfig);
controlConfigButtonModeEl.addEventListener("change", updateControlConfigFieldVisibility);

document.addEventListener("pointerdown", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    closeAllMenus();
  }

  if (!event.target.closest(".confirm-dialog") && !deleteConfirmModalEl.classList.contains("hidden")) {
    closeDeleteConfirm();
  }

  if (!event.target.closest(".control-config-dialog") && !controlConfigModalEl.classList.contains("hidden")) {
    closeControlConfig();
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

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (currentPage === 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
    handleTelemetrySwipe(deltaY);
  } else {
    handleSwipe(deltaX);
  }

  touchStartX = null;
  touchStartY = null;
}, { passive: true });

appShellEl.addEventListener("touchcancel", () => {
  touchStartX = null;
  touchStartY = null;
});

appShellEl.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0 || activeDrag) {
    return;
  }

  if (shouldIgnoreSwipeTarget(event.target)) {
    pointerSwipe = null;
    return;
  }

  pointerSwipe = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
  };
});

appShellEl.addEventListener("pointermove", (event) => {
  if (
    !pointerSwipe
    || event.pointerType !== "mouse"
    || event.pointerId !== pointerSwipe.pointerId
  ) {
    return;
  }

  const deltaX = event.clientX - pointerSwipe.startX;
  const deltaY = event.clientY - pointerSwipe.startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    event.preventDefault();
  }
});

function clearPointerSwipe() {
  pointerSwipe = null;
}

appShellEl.addEventListener("pointerup", (event) => {
  if (
    !pointerSwipe
    || event.pointerType !== "mouse"
    || event.pointerId !== pointerSwipe.pointerId
  ) {
    return;
  }

  const deltaX = event.clientX - pointerSwipe.startX;
  const deltaY = event.clientY - pointerSwipe.startY;

  if (currentPage === 0 && Math.abs(deltaY) > Math.abs(deltaX)) {
    handleTelemetrySwipe(deltaY);
  } else {
    handleSwipe(deltaX);
  }

  clearPointerSwipe();
});

appShellEl.addEventListener("pointercancel", clearPointerSwipe);
appShellEl.addEventListener("pointerleave", clearPointerSwipe);

setInterval(() => {
  if (currentPage === 0) {
    fetchTelemetry();
  }
}, 250);
fetchTelemetry();
setPage(0);
setTelemetryPage(0);
closeDeleteConfirm();
