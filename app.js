/* ══════════════════════════════════════════════
   NEXUS Gaming Desk App — app.js
   All interactivity and live data
══════════════════════════════════════════════ */

/* ── State ──────────────────────────────────── */
const state = {
  currentPage: 'dashboard',
  deskHeight: 63,
  activeMode: 'Gaming',
  activeColor: '#00f5ff',
  uptimeSeconds: 0,
  chargingPcts: [100, 67, 0, 41],
  chargingActive: [true, true, false, true],
};

/* ── Page Navigation ────────────────────────── */
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Show target
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  // Activate nav button
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: { icon: '⚡', text: 'Dashboard' },
    lighting:  { icon: '💡', text: 'Lighting' },
    desk:      { icon: '📐', text: 'Desk Height' },
    charging:  { icon: '🔋', text: 'Charging' },
    profiles:  { icon: '🎮', text: 'Profiles' },
    ambient:   { icon: '🌊', text: 'Ambient' },
    schedule:  { icon: '🕐', text: 'Schedule' },
    analytics: { icon: '📊', text: 'Analytics' },
    settings:  { icon: '⚙️', text: 'Settings' },
  };
  const t = titles[page] || { icon: '⚡', text: page };
  document.getElementById('pageTitle').innerHTML =
    `<span class="title-icon">${t.icon}</span><span class="title-text">${t.text}</span>`;

  state.currentPage = page;

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

// Bind nav buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.getAttribute('data-page');
    if (page) navigateTo(page);
  });
});

/* ── Sidebar Mobile Toggle ──────────────────── */
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

/* ── Notifications ──────────────────────────── */
const notifBell = document.getElementById('notifBell');
const notifPanel = document.getElementById('notifPanel');

notifBell.addEventListener('click', (e) => {
  e.stopPropagation();
  const isVisible = notifPanel.style.display !== 'none';
  notifPanel.style.display = isVisible ? 'none' : 'block';
});
document.getElementById('notifClose').addEventListener('click', () => {
  notifPanel.style.display = 'none';
});
document.addEventListener('click', (e) => {
  if (!notifPanel.contains(e.target) && !notifBell.contains(e.target)) {
    notifPanel.style.display = 'none';
  }
});

/* ── Uptime Counter ─────────────────────────── */
setInterval(() => {
  state.uptimeSeconds++;
  const m = Math.floor(state.uptimeSeconds / 60);
  const s = state.uptimeSeconds % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  const el = document.getElementById('hdr-uptime');
  if (el) el.textContent = `${fmt(m)}:${fmt(s)}`;
}, 1000);

/* ── Live Header Stats ──────────────────────── */
setInterval(() => {
  const power = 80 + Math.floor(Math.random() * 15);
  const temp = 21 + Math.floor(Math.random() * 3);
  const el1 = document.getElementById('hdr-power');
  const el2 = document.getElementById('hdr-temp');
  if (el1) el1.textContent = power + 'W';
  if (el2) el2.textContent = temp + '°C';
}, 3000);

/* ════════════════════════════════════════════
   DASHBOARD FUNCTIONS
════════════════════════════════════════════ */

/* RGB color quick select */
window.dashQuickColor = function(el) {
  document.querySelectorAll('.rqc').forEach(r => r.classList.remove('active'));
  el.classList.add('active');
  const color = el.getAttribute('data-color');
  if (!color) return;
  state.activeColor = color;
  const bar = document.getElementById('dash-rgb-bar');
  if (bar) {
    bar.style.background = `linear-gradient(90deg, ${color}88, ${color}, ${color}cc)`;
    bar.style.boxShadow = `0 0 15px ${color}80`;
  }
  const glow = document.getElementById('dash-rgb-glow');
  if (glow) glow.style.background = `linear-gradient(90deg, ${color}66, ${color}, ${color}44)`;
};

window.dashRainbow = function() {
  document.querySelectorAll('.rqc').forEach(r => r.classList.remove('active'));
  const bar = document.getElementById('dash-rgb-bar');
  if (bar) {
    bar.style.background = 'linear-gradient(90deg, #bf00ff, #0066ff, #00f5ff, #ff00aa, #bf00ff)';
    bar.style.boxShadow = '0 0 15px rgba(0,245,255,0.5)';
  }
};

/* Mode selection */
window.dashSetMode = function(el) {
  document.querySelectorAll('.mqb').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const mode = el.getAttribute('data-mode');
  const icon = el.getAttribute('data-icon');
  state.activeMode = mode;
  const descs = {
    Gaming: 'Reactive pulse sync',
    Wave: 'Ocean wave flow',
    Music: 'Beat-sync rhythm',
    Zen: 'Slow breathing',
  };
  const display = document.getElementById('dash-mode-display');
  if (display) display.innerHTML = `
    <div class="amd-icon">${icon}</div>
    <div class="amd-name">${mode.toUpperCase()}</div>
    <div class="amd-desc">${descs[mode] || ''}</div>
  `;
  addLogEntry(icon, `Mode set to ${mode}`);
};

/* Height controls (dashboard) */
window.dashSetHeight = function(h, preset) {
  state.deskHeight = h;
  document.querySelectorAll('.hqb').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const numEl = document.getElementById('dash-height-num');
  const preEl = document.getElementById('dash-height-preset');
  const gsEl = document.getElementById('qs-height');
  if (numEl) numEl.textContent = h;
  if (preEl) preEl.textContent = preset;
  if (gsEl) gsEl.textContent = h + ' cm';

  updateHeightGauge(h);
  addLogEntry('📐', `Desk set to ${h}cm (${preset})`);
};

function updateHeightGauge(h) {
  const min = 55, max = 118;
  const pct = ((h - min) / (max - min)) * 100;
  const fill = document.getElementById('dash-gauge-fill');
  if (fill) fill.style.height = pct + '%';
}

/* ════════════════════════════════════════════
   LIGHTING FUNCTIONS
════════════════════════════════════════════ */

/* Toggle zone on/off */
window.toggleZoneCard = function(toggleEl) {
  toggleEl.classList.toggle('on');
  const card = toggleEl.closest('.zone-card');
  if (card) card.classList.toggle('active', toggleEl.classList.contains('on'));
};

/* Set zone effect */
window.setZoneEffect = function(el, effect) {
  const row = el.closest('.zc-effect-row');
  if (row) row.querySelectorAll('.zce').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const nameEl = el.closest('.zone-card')?.querySelector('.zc-mode');
  if (nameEl) {
    const dot = el.closest('.zone-card')?.querySelector('.zc-color-dot');
    const color = dot?.style.background || '';
    nameEl.textContent = `${effect} · Custom`;
  }
};

/* Mini-slider intensity display */
document.querySelectorAll('.zc-bright-row .mini-slider').forEach(slider => {
  slider.addEventListener('input', function() {
    const valEl = this.closest('.zc-bright-row')?.querySelector('.zc-bright-val');
    if (valEl) valEl.textContent = this.value + '%';
  });
});

/* Color picker */
const colorSpectrum = document.getElementById('colorSpectrum');
const specCursor = document.getElementById('specCursor');
const colorSwatch = document.getElementById('colorSwatch');
const colorHexInput = document.getElementById('colorHexInput');
const colorRGBDisplay = document.getElementById('colorRGBDisplay');
const hueSlider = document.getElementById('hueSlider');

let currentHue = 180;

function updateColorFromHue(hue) {
  currentHue = hue;
  colorSpectrum.style.background = `
    linear-gradient(to bottom, white, transparent),
    linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
  `;
}

function hexFromHSL(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

if (hueSlider) {
  hueSlider.addEventListener('input', function() {
    updateColorFromHue(parseInt(this.value));
  });
  updateColorFromHue(180);
}

if (colorSpectrum) {
  colorSpectrum.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 50);
    const hex = hexFromHSL(currentHue, s, l);
    applyColorUI(hex);
    if (specCursor) {
      specCursor.style.left = x + 'px';
      specCursor.style.top = y + 'px';
    }
  });
}

if (colorHexInput) {
  colorHexInput.addEventListener('change', function() {
    if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
      applyColorUI(this.value);
    }
  });
}

function applyColorUI(hex) {
  if (colorSwatch) {
    colorSwatch.style.background = hex;
    colorSwatch.style.boxShadow = `0 0 20px ${hex}66`;
  }
  if (colorHexInput) colorHexInput.value = hex;
  if (colorRGBDisplay) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    colorRGBDisplay.textContent = `R:${r} G:${g} B:${b}`;
  }
}
applyColorUI('#00f5ff');

window.applyPresetColor = function(hex) {
  applyColorUI(hex);
};

/* Light preview update */
window.updateLightPreview = function() {};

/* ════════════════════════════════════════════
   DESK HEIGHT FUNCTIONS
════════════════════════════════════════════ */

let deskPageH = 63;

function setDeskPageHeight(h, animateMotor = true) {
  h = Math.max(55, Math.min(118, Math.round(h)));
  const prev = deskPageH;
  deskPageH = h;
  state.deskHeight = h;

  const numEl = document.getElementById('desk-page-height');
  const inputEl = document.getElementById('heightDirectInput');
  const sliderEl = document.getElementById('deskRangeSlider');
  const rvFill = document.getElementById('rv-fill');

  if (numEl) numEl.textContent = h;
  if (inputEl) inputEl.value = h;
  if (sliderEl) sliderEl.value = h;

  const pct = ((h - 55) / 63) * 100;
  if (rvFill) rvFill.style.width = pct + '%';

  // Update dashboard too
  const dashNum = document.getElementById('dash-height-num');
  if (dashNum) dashNum.textContent = h;
  updateHeightGauge(h);
  const gsEl = document.getElementById('qs-height');
  if (gsEl) gsEl.textContent = h + ' cm';

  // Custom preset display
  const customVal = document.getElementById('custom-preset-val');
  if (customVal && !customVal._saved) customVal.textContent = h + ' cm';

  if (animateMotor) {
    const dir = h > prev ? 'up' : (h < prev ? 'down' : null);
    if (dir) setMotorState(dir, h);
  }
}

function setMotorState(dir, targetH) {
  const stateEl = document.getElementById('motorState');
  const ledEl = document.getElementById('motorLed');
  if (!stateEl || !ledEl) return;

  if (dir === 'up') {
    stateEl.textContent = '▲ Moving Up';
    stateEl.style.color = 'var(--green)';
    ledEl.className = 'msc-led up';
  } else if (dir === 'down') {
    stateEl.textContent = '▼ Moving Down';
    stateEl.style.color = 'var(--orange)';
    ledEl.className = 'msc-led down';
  }

  setTimeout(() => {
    stateEl.textContent = 'Idle';
    stateEl.style.color = 'var(--cyan)';
    if (ledEl) ledEl.className = 'msc-led idle';
    addLogEntry('📐', `Desk moved to ${targetH}cm`);
  }, 1400);
}

window.pageAdjHeight = function(delta) {
  setDeskPageHeight(deskPageH + delta);
};

window.setDirectHeight = function() {
  const val = parseInt(document.getElementById('heightDirectInput')?.value || 72);
  setDeskPageHeight(val);
};

document.getElementById('deskRangeSlider')?.addEventListener('input', function() {
  setDeskPageHeight(parseInt(this.value), true);
});

window.sliderSetHeight = function(val) {
  setDeskPageHeight(parseInt(val), true);
};

window.loadPreset = function(el, h, name, desc) {
  document.querySelectorAll('.preset-card').forEach(c => {
    c.classList.remove('active');
    const badge = c.querySelector('.pc-badge');
    if (badge) badge.remove();
  });
  el.classList.add('active');
  const badge = document.createElement('div');
  badge.className = 'pc-badge active-badge';
  badge.textContent = 'Active';
  el.appendChild(badge);
  setDeskPageHeight(h);

  const preset = document.getElementById('dash-height-preset');
  if (preset) preset.textContent = name;
};

window.addCustomPreset = function() {
  const customVal = document.getElementById('custom-preset-val');
  if (customVal) {
    customVal.textContent = deskPageH + ' cm';
    customVal._saved = true;
  }
  addLogEntry('⭐', `Custom preset saved: ${deskPageH}cm`);
};

/* ════════════════════════════════════════════
   CHARGING FUNCTIONS
════════════════════════════════════════════ */

window.toggleCharger = function(idx) {
  const isActive = state.chargingActive[idx];
  state.chargingActive[idx] = !isActive;
  const card = document.getElementById('chg-' + idx);
  const ring = document.getElementById('ring-' + idx);
  const statusEl = document.getElementById('status-' + idx);
  const powerEl = document.getElementById('power-' + idx);
  const btn = card?.querySelector('.cdc-toggle-btn');

  if (!isActive) {
    card?.classList.add('active');
    if (ring) ring.classList.add('charging');
    if (statusEl) { statusEl.textContent = '⚡ Charging'; statusEl.className = 'cdc-status charging-status'; }
    if (powerEl) powerEl.textContent = '15W · 9V';
    if (btn) { btn.textContent = 'Disconnect'; btn.classList.remove('disabled'); }
    addLogEntry('🔋', `Pad ${String.fromCharCode(65 + idx)} connected`);
  } else {
    card?.classList.remove('active');
    if (ring) ring.classList.remove('charging');
    if (statusEl) { statusEl.textContent = '○ Disconnected'; statusEl.className = 'cdc-status empty-status'; }
    if (powerEl) powerEl.textContent = 'No device';
    if (btn) { btn.textContent = 'Connect'; }
    addLogEntry('🔌', `Pad ${String.fromCharCode(65 + idx)} disconnected`);
  }
};

/* Simulate charging progress */
setInterval(() => {
  [1, 3].forEach(idx => {
    if (!state.chargingActive[idx]) return;
    const pct = state.chargingPcts[idx];
    if (pct >= 100) return;
    const newPct = Math.min(100, pct + 1);
    state.chargingPcts[idx] = newPct;

    const pctEl = document.getElementById('pct-' + idx);
    const barEl = document.getElementById('bar-' + idx);
    if (pctEl) pctEl.textContent = newPct + '%';
    if (barEl) barEl.style.width = newPct + '%';

    // Update dashboard mini
    if (idx === 1) {
      const cm = document.getElementById('cm-headset');
      const cmBar = document.getElementById('cm-headset-bar');
      if (cm) cm.textContent = newPct + '%';
      if (cmBar) cmBar.style.width = newPct + '%';
    }
    if (idx === 3) {
      const cm = document.getElementById('cm-mouse');
      const cmBar = document.getElementById('cm-mouse-bar');
      if (cm) cm.textContent = newPct + '%';
      if (cmBar) cmBar.style.width = newPct + '%';
    }

    if (newPct === 100) {
      const statusEl = document.getElementById('status-' + idx);
      if (statusEl) statusEl.textContent = '● Full';
      const powerEl = document.getElementById('power-' + idx);
      if (powerEl) powerEl.textContent = '0W · 5V';
      addLogEntry('🔋', `Pad ${String.fromCharCode(65 + idx)} fully charged!`);
    }

    // Update power summary
    updatePowerSummary();
  });
}, 4000);

function updatePowerSummary() {
  const draws = { 0: 0, 1: 15, 2: 0, 3: 10 };
  let total = 0;
  state.chargingActive.forEach((active, i) => {
    if (active && state.chargingPcts[i] < 100) total += draws[i] || 0;
  });
  const psNum = document.getElementById('ps-total');
  const psBar = document.getElementById('ps-bar');
  if (psNum) psNum.textContent = total + 'W';
  if (psBar) psBar.style.width = Math.round((total / 60) * 100) + '%';
}

/* ════════════════════════════════════════════
   PROFILES FUNCTIONS
════════════════════════════════════════════ */

window.activateProfile = function(el, name) {
  document.querySelectorAll('.profile-card').forEach(c => {
    c.classList.remove('active-profile');
    const glow = c.querySelector('.profile-glow');
    if (glow) glow.remove();
    const tag = c.querySelector('.profile-active-tag');
    if (tag) tag.remove();
  });

  el.classList.add('active-profile');
  const glow = document.createElement('div');
  glow.className = 'profile-glow';
  el.prepend(glow);
  const tag = document.createElement('div');
  tag.className = 'profile-active-tag';
  tag.textContent = '● Active';
  el.appendChild(tag);

  addLogEntry('🎮', `Profile "${name}" activated`);
};

/* ════════════════════════════════════════════
   ACTIVITY LOG
════════════════════════════════════════════ */

const logColors = ['cyan', 'purple', 'blue', 'pink'];
let logColorIdx = 0;

function addLogEntry(icon, message) {
  const logList = document.getElementById('logList');
  if (!logList) return;

  const color = logColors[logColorIdx % logColors.length];
  logColorIdx++;

  const now = new Date();
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.style.opacity = '0';
  entry.style.transform = 'translateX(-10px)';
  entry.style.transition = 'all 0.3s';
  entry.innerHTML = `
    <span class="log-dot ${color}"></span>
    <span class="log-msg">${message}</span>
    <span class="log-time">${time}</span>
  `;

  logList.insertBefore(entry, logList.firstChild);

  // Animate in
  requestAnimationFrame(() => {
    entry.style.opacity = '1';
    entry.style.transform = 'translateX(0)';
  });

  // Keep only 6 entries
  while (logList.children.length > 6) {
    logList.removeChild(logList.lastChild);
  }
}

/* ── Init ───────────────────────────────────── */
navigateTo('dashboard');
updateHeightGauge(state.deskHeight);
updatePowerSummary();
setDeskPageHeight(63, false);