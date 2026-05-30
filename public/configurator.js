/* ============================================================
   CREMEN Smart Water — Modular Model Configurator
   Pure client-side. Pick options per phase → live price + BOM.
   Block costs sourced from the .cdcos spec. No framework.
   ============================================================ */

/* ---- Phase / option definitions ---- */
const PHASES = [
  { key: "tier", label: "Tier", help: "Build quality & control style",
    opts: [
      { id: "A", label: "A · Frugal", sub: "Agricultural retrofit" },
      { id: "B", label: "B · Premium", sub: "Urban advanced grid" },
    ] },
  { key: "conn", label: "Connectivity", help: "How the system reaches the cloud",
    opts: [
      { id: "wifi", label: "Wi-Fi only", sub: "uses router · −₹1,160" },
      { id: "gsm",  label: "GSM / 4G",  sub: "A7670C · remote sites" },
    ] },
  { key: "power", label: "Tank power", help: "Power available at the tank?",
    opts: [
      { id: "wired",   label: "Wired adapter", sub: "socket near tank" },
      { id: "battery", label: "Battery",       sub: "Li-SOCl₂ · 2–3 yr" },
    ] },
  { key: "sensing", label: "Sensing depth", help: "Which tank readings",
    opts: [
      { id: "level", label: "Level only",     sub: "ultrasonic" },
      { id: "full",  label: "Full quality",   sub: "+ TDS + pH" },
    ] },
  { key: "scope", label: "Control scope", help: "What the system actuates",
    opts: [
      { id: "motor", label: "Motor only",  sub: "pump on/off" },
      { id: "valve", label: "Valve only",  sub: "flow + cleaning" },
      { id: "both",  label: "Both",        sub: "motor + valve + clean" },
    ] },
];

/* ---- Block costs (₹) ---- */
const TANK = {
  controller: 400,        // ESP32 (always)
  level: 450,             // JSN-SR04T (always)
  quality: 650,           // TDS 350 + pH 300 (sensing=full)
  gsm: 1160,              // A7670C 4G (conn=gsm)
  powerBattery: 430,      // Li-SOCl2 250 + supercap 180
  powerWired: 250,        // 5V adapter
  flushValve: 650,        // 12V latching solenoid (scope includes valve)
};
const GATEWAY = {
  A: { base: 890,  baseLabel: "Gateway base (ESP32 + OLED + micro-switches + 5V adapter)",
       motor: 120, motorLabel: "2-Ch 5V relay (pulse starter)",
       valve: 300, valveLabel: "MG996R servo (clamp-on valve)",
       clean: 0,   cleanLabel: null },                       // A cleaning = siphon, no extra parts
  B: { base: 990,  baseLabel: "Gateway base (ESP32 + OLED + ring-LED buttons + dual SMPS)",
       motor: 250, motorLabel: "30A power relay (direct switch)",
       valve: 650, valveLabel: "12V motorized inline valve",
       clean: 550, cleanLabel: "Cleaning loop (12V circ. pump + filter box)" },
};

const FULL_A_TOTAL = 5050; // spec anchor for savings calc

/* ---- Pure pricing function ---- */
function priceBuild(c) {
  const tankItems = [];
  tankItems.push({ name: "ESP32-WROOM-32D (controller)", cost: TANK.controller });
  tankItems.push({ name: "JSN-SR04T ultrasonic level", cost: TANK.level });
  if (c.sensing === "full") tankItems.push({ name: "TDS + pH water-quality", cost: TANK.quality });
  if (c.conn === "gsm")     tankItems.push({ name: "A7670C 4G LTE module", cost: TANK.gsm });
  if (c.power === "battery") tankItems.push({ name: "Li-SOCl₂ battery + supercapacitor", cost: TANK.powerBattery });
  else                       tankItems.push({ name: "5V wired adapter", cost: TANK.powerWired });
  const hasValve = c.scope === "valve" || c.scope === "both";
  const hasMotor = c.scope === "motor" || c.scope === "both";
  if (hasValve) tankItems.push({ name: "12V latching flush solenoid", cost: TANK.flushValve });

  const g = GATEWAY[c.tier];
  const gatewayItems = [];
  gatewayItems.push({ name: g.baseLabel, cost: g.base });
  if (hasMotor) gatewayItems.push({ name: g.motorLabel, cost: g.motor });
  if (hasValve) gatewayItems.push({ name: g.valveLabel, cost: g.valve });
  if (hasValve && g.clean) gatewayItems.push({ name: g.cleanLabel, cost: g.clean });

  const tankTotal = tankItems.reduce((s, i) => s + i.cost, 0);
  const gatewayTotal = gatewayItems.reduce((s, i) => s + i.cost, 0);
  const total = tankTotal + gatewayTotal;
  return { tankItems, gatewayItems, tankTotal, gatewayTotal, total, savings: FULL_A_TOTAL - total };
}

/* ---- Presets ---- */
const PRESETS = {
  "Lite-Motor":  { tier: "A", conn: "wifi", power: "wired",   sensing: "level", scope: "motor" },
  "Valve-only":  { tier: "A", conn: "wifi", power: "wired",   sensing: "level", scope: "valve" },
  "Smart-A full":{ tier: "A", conn: "gsm",  power: "battery", sensing: "full",  scope: "both" },
  "Urban Wi-Fi": { tier: "B", conn: "wifi", power: "wired",   sensing: "full",  scope: "both" },
  "Pro-B full":  { tier: "B", conn: "gsm",  power: "battery", sensing: "full",  scope: "both" },
};

/* ---- State + render ---- */
const state = { tier: "A", conn: "wifi", power: "wired", sensing: "level", scope: "motor" };
const rupee = (n) => "₹" + n.toLocaleString("en-IN");

function buildControls() {
  const host = document.getElementById("cfg-controls");
  if (!host) return;
  host.innerHTML = PHASES.map(ph => `
    <div class="optgroup" data-key="${ph.key}">
      <div class="optgroup-head"><b>${ph.label}</b><span>${ph.help}</span></div>
      <div class="seg">
        ${ph.opts.map(o => `
          <button class="seg-btn" data-key="${ph.key}" data-id="${o.id}">
            <span class="seg-main">${o.label}</span>
            <span class="seg-sub">${o.sub}</span>
          </button>`).join("")}
      </div>
    </div>`).join("");

  host.querySelectorAll(".seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state[btn.dataset.key] = btn.dataset.id;
      render();
    });
  });

  const presetHost = document.getElementById("cfg-presets");
  if (presetHost) {
    presetHost.innerHTML = Object.keys(PRESETS)
      .map(name => `<button class="preset" data-preset="${name}">${name}</button>`).join("");
    presetHost.querySelectorAll(".preset").forEach(b => {
      b.addEventListener("click", () => { Object.assign(state, PRESETS[b.dataset.preset]); render(); });
    });
  }
}

function render() {
  // active button highlight
  document.querySelectorAll(".seg-btn").forEach(btn => {
    btn.classList.toggle("active", state[btn.dataset.key] === btn.dataset.id);
  });
  document.querySelectorAll(".preset").forEach(b => {
    const p = PRESETS[b.dataset.preset];
    b.classList.toggle("active", Object.keys(p).every(k => p[k] === state[k]));
  });

  const r = priceBuild(state);

  // price panel
  const panel = document.getElementById("cfg-price");
  if (panel) {
    const saved = r.savings > 0
      ? `<span class="save">saves ${rupee(r.savings)} vs Full Model A</span>`
      : (r.savings < 0 ? `<span class="over">${rupee(-r.savings)} above Full Model A</span>` : "");
    panel.innerHTML = `
      <div class="big-price">${rupee(r.total)}</div>
      <div class="price-sub">Tank ${rupee(r.tankTotal)} · Gateway ${rupee(r.gatewayTotal)}</div>
      ${saved}`;
  }

  // summary chips
  const sum = document.getElementById("cfg-summary");
  if (sum) {
    const labelOf = (key, id) => PHASES.find(p => p.key === key).opts.find(o => o.id === id).label;
    sum.innerHTML = PHASES.map(p => `<span class="chip">${labelOf(p.key, state[p.key])}</span>`).join("");
  }

  // BOM table
  const bom = document.getElementById("cfg-bom");
  if (bom) {
    const row = (i) => `<tr><td>${i.name}</td><td class="cost">${rupee(i.cost)}</td></tr>`;
    bom.innerHTML = `
      <div class="table-wrap">
        <table>
          <caption>Tank Node — ${rupee(r.tankTotal)}</caption>
          <thead><tr><th>Component</th><th class="cost">Cost</th></tr></thead>
          <tbody>${r.tankItems.map(row).join("")}</tbody>
        </table>
      </div>
      <div class="table-wrap">
        <table>
          <caption>Gateway Node (Tier ${state.tier}) — ${rupee(r.gatewayTotal)}</caption>
          <thead><tr><th>Component</th><th class="cost">Cost</th></tr></thead>
          <tbody>${r.gatewayItems.map(row).join("")}</tbody>
        </table>
      </div>`;
  }
}

buildControls();
render();
