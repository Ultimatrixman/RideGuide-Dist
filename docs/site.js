/* RideGuide landing page behavior.
 *
 * Gauge drawing is adapted from the app's own second-screen library
 * (rideguide/web/static/gauges.js), fed by a synthetic lap model — so the
 * demo cluster renders exactly like the real product. No network, no deps.
 */
"use strict";

document.documentElement.classList.add("js");

var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================== Theme ============================== */

var THEME = {
  ACCENT: "#7c5cff",
  TEXT_PRIMARY: "#d9d9de",
  TEXT_SECONDARY: "#9a9aa5",
  POSITIVE: "#4caf50",
  NEGATIVE: "#ef5350",
  NEUTRAL: "#ffb74d",
  STEER: "#4fc3f7",
  DIM: "#2a2a33",
  REDLINE_DIM: "#3a2226",
  GRID: "#26262e",
  FONT: '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
};
var ZONES = [[0.0, THEME.ACCENT], [0.75, THEME.NEUTRAL], [0.9, THEME.NEGATIVE]];

/* ============================== Nav ============================== */

var nav = document.getElementById("nav");
function updateNav() {
  if (window.scrollY > window.innerHeight * 0.55) nav.classList.add("shown");
  else nav.classList.remove("shown");
}
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

/* ============================== Hero parallax ============================== */

var layers = Array.prototype.slice.call(
  document.querySelectorAll(".hero-layer, .hero-title")
);
var hero = document.getElementById("top");
var parTicking = false;

function applyParallax() {
  parTicking = false;
  var y = window.scrollY;
  var limit = hero.offsetHeight;
  if (y > limit) y = limit;
  for (var i = 0; i < layers.length; i++) {
    var el = layers[i];
    var factor = parseFloat(el.getAttribute("data-par")) || 0;
    el.style.transform = "translate3d(-50%," + (y * factor).toFixed(1) + "px,0)";
    if (el.getAttribute("data-fade")) {
      var op = 1 - Math.min(1, (y / limit) * 1.6);
      el.style.opacity = op.toFixed(3);
    }
  }
}
if (!REDUCED) {
  window.addEventListener("scroll", function () {
    if (!parTicking) {
      parTicking = true;
      requestAnimationFrame(applyParallax);
    }
  }, { passive: true });
  applyParallax();
}

/* ============================== Hero splash scene ==============================
 * Ported from the app's animated splash (rideguide/ui/splash_screen.py):
 * back plate -> digital-sunset sun cuts -> sliding grid fan -> car plate ->
 * KITT scanner sweep. Geometry constants come from splash_bg.json (960x640
 * asset space); the canvas cover-fits that space to the hero. */

var SPLASH = {
  sun: { rx: 243.22, ry: 226.0, rw: 475.22, rh: 289.67, band0: 136.56, band1: 422.22 },
  grid: { vx: 480.0, vy: 468.33, spacing: 88.0, n: 13 },
  scanner: [[361.0, 530.5], [154.0, 510.0], [154.0, 524.0], [361.0, 544.5]],
  SUN_HZ: 0.14, SUN_CUTS: 7, GRID_DRIFT: 0.22, SCAN_HZ: 0.7,
};

(function splashScene() {
  var canvas = document.getElementById("splash-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var sources = { back: "splash_back.webp", front: "splash_front.webp", sun: "splash_sun.webp" };
  var el = {}, remaining = 3;
  Object.keys(sources).forEach(function (key) {
    var im = new Image();
    im.onload = function () { remaining -= 1; if (!remaining) start(); };
    im.src = "assets/" + sources[key];
    el[key] = im;
  });

  function clampStop(grad, offset, color) {
    grad.addColorStop(Math.max(0, Math.min(1, offset)), color);
  }

  function sunCuts(t) {
    var g = SPLASH.sun;
    var sy = el.sun.height / g.rh; /* sprite px per scene px */
    var phase = (t * SPLASH.SUN_HZ) % 1;
    var cuts = [];
    for (var i = 0; i < SPLASH.SUN_CUTS; i++) {
      var f = (i / SPLASH.SUN_CUTS + phase) % 1;
      cuts.push([g.band0 + f * (g.band1 - g.band0), 2.4 + 15.0 * f]);
    }
    cuts.sort(function (a, b) { return a[0] - b[0]; });
    function blit(y0, y1) {
      if (y1 <= y0) return;
      var srcY = (y0 - g.ry) * sy;
      var srcH = Math.min((y1 - y0) * sy, el.sun.height - srcY);
      if (srcH <= 0) return;
      ctx.drawImage(el.sun, 0, srcY, el.sun.width, srcH, g.rx, y0, g.rw, y1 - y0);
    }
    var cur = g.ry;
    for (i = 0; i < cuts.length; i++) {
      blit(cur, Math.min(cuts[i][0], g.ry + g.rh));
      cur = Math.max(cur, cuts[i][0] + cuts[i][1]);
    }
    blit(cur, g.ry + g.rh);
  }

  function gridFan(t) {
    var g = SPLASH.grid;
    var offset = (t * SPLASH.GRID_DRIFT) % 1;
    var strokes = [[8.4, 26], [4.0, 72], [1.8, 150]];
    for (var k = -g.n - 1; k <= g.n; k++) {
      var kf = k + offset;
      var fade = 1 - 0.35 * Math.min(1, Math.abs(kf) / g.n);
      var edge = Math.max(0, Math.min(1, g.n - Math.abs(kf) + 1));
      if (edge <= 0) continue;
      var xBot = g.vx + kf * g.spacing;
      for (var s = 0; s < strokes.length; s++) {
        ctx.strokeStyle = "rgba(255,43,214," +
          ((strokes[s][1] / 255) * fade * edge).toFixed(3) + ")";
        ctx.lineWidth = strokes[s][0];
        ctx.beginPath();
        ctx.moveTo(g.vx, g.vy + 1);
        ctx.lineTo(xBot, 648);
        ctx.stroke();
      }
    }
  }

  function scanner(t) {
    var q = SPLASH.scanner;
    var ax = (q[0][0] + q[3][0]) / 2, ay = (q[0][1] + q[3][1]) / 2;
    var bx = (q[1][0] + q[2][0]) / 2, by = (q[1][1] + q[2][1]) / 2;
    var cycle = (t * SPLASH.SCAN_HZ) % 1;
    var pos = 0.5 - 0.5 * Math.cos(2 * Math.PI * cycle);
    var px = ax + (bx - ax) * pos, py = ay + (by - ay) * pos;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(q[0][0], q[0][1]);
    ctx.lineTo(q[1][0], q[1][1]);
    ctx.lineTo(q[2][0], q[2][1]);
    ctx.lineTo(q[3][0], q[3][1]);
    ctx.closePath();
    ctx.clip();
    var grad = ctx.createLinearGradient(ax, ay, bx, by);
    clampStop(grad, pos - 0.30, "rgba(190,16,16,0)");
    clampStop(grad, pos - 0.10, "rgba(255,60,24,0.78)");
    clampStop(grad, pos, "rgba(255,208,150,1)");
    clampStop(grad, pos + 0.10, "rgba(255,60,24,0.78)");
    clampStop(grad, pos + 0.30, "rgba(190,16,16,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(150, 504, 218, 46);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var halo = ctx.createRadialGradient(px, py, 0, px, py, 32);
    halo.addColorStop(0, "rgba(255,42,18,0.43)");
    halo.addColorStop(1, "rgba(255,42,18,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(px, py, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw(t) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }

    var s = Math.max(w / 960, h / 640) * 1.06;
    /* Narrow screens focus on the car's nose (RIDE grille + scanner) instead
     * of the scene center, which would land on the windshield. */
    var focusX = w < 640 ? 330 : 480;
    var ox = Math.max(w - 960 * s, Math.min(0, w / 2 - focusX * s));
    var oy = Math.max(h - 640 * s, Math.min(0, (h - 640 * s) / 2 + 0.02 * h));
    var scroll = REDUCED ? 0 : Math.min(window.scrollY || 0, h * 1.2);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    /* far group: portal room, animated sun, grid fan */
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * (oy + scroll * 0.06));
    ctx.drawImage(el.back, 0, 0, 960, 640);
    sunCuts(t);
    gridFan(t);

    /* near group: the car, with its scanner sweep */
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * (oy + scroll * 0.22));
    ctx.drawImage(el.front, 0, 0, 960, 640);
    scanner(t);
  }

  var running = false, heroVisible = true, t0 = null;
  function frame(now) {
    if (t0 === null) t0 = now;
    draw((now - t0) / 1000);
    if (heroVisible && !document.hidden) requestAnimationFrame(frame);
    else running = false;
  }
  function kick() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  function start() {
    if (REDUCED) {
      draw(3.2);
      window.addEventListener("resize", function () { draw(3.2); });
      return;
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) kick();
      }, { threshold: 0.01 }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && heroVisible) kick();
    });
    kick();
  }
})();

/* ============================== Scroll reveal ============================== */

var revealEls = document.querySelectorAll(".reveal");
if (!REDUCED && "IntersectionObserver" in window) {
  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        ro.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealEls.forEach(function (el) { ro.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add("in"); });
}

/* ============================== Radio vignette ============================== */

var RADIO_LINES = [
  { who: "COACH", cls: "coach", text: "Brake later into Turn 4 — you're giving up three tenths on entry." },
  { who: "SPOTTER", cls: "spotter", text: "Car right. Hold your line." },
  { who: "ENGINEER", cls: "engineer", text: "Box this lap — fuel's good for two more at this pace." },
  { who: "COACH", cls: "coach", text: "Fronts are up to temp now. Lean on them through the fast left." },
];

(function radio() {
  var host = document.getElementById("radio-lines");
  if (!host) return;

  function build(line) {
    var row = document.createElement("div");
    row.className = "radio-line";
    var who = document.createElement("span");
    who.className = "radio-who " + line.cls;
    who.textContent = line.who;
    var text = document.createElement("span");
    text.className = "radio-text";
    row.appendChild(who);
    row.appendChild(text);
    return { row: row, text: text };
  }

  if (REDUCED) {
    RADIO_LINES.slice(0, 3).forEach(function (line) {
      var parts = build(line);
      parts.text.textContent = line.text;
      host.appendChild(parts.row);
    });
    return;
  }

  var index = 0;
  function next() {
    var line = RADIO_LINES[index % RADIO_LINES.length];
    index += 1;
    var parts = build(line);
    parts.row.classList.add("typing");
    host.appendChild(parts.row);
    while (host.children.length > 3) host.removeChild(host.firstChild);

    var pos = 0;
    var timer = setInterval(function () {
      pos += 1;
      parts.text.textContent = line.text.slice(0, pos);
      if (pos >= line.text.length) {
        clearInterval(timer);
        parts.row.classList.remove("typing");
        setTimeout(next, 2400);
      }
    }, 26);
  }
  next();
})();

/* ============================== Gauge drawing (from gauges.js) ============================== */

function fitCanvas(canvas) {
  var dpr = window.devicePixelRatio || 1;
  var w = Math.max(1, canvas.clientWidth || canvas.width);
  var h = Math.max(1, canvas.clientHeight || canvas.height);
  var pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
  var ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: h };
}

function font(px, bold) { return (bold ? "bold " : "") + Math.round(px) + "px " + THEME.FONT; }

function zoneColor(frac) {
  var color = ZONES[0][1];
  for (var i = 0; i < ZONES.length; i++) if (frac >= ZONES[i][0]) color = ZONES[i][1];
  return color;
}

function drawRadial(ctx, w, h, value, min, max, unit, label, decimals) {
  var segments = 44;
  var v = Math.max(min, Math.min(max, value));
  var frac = (v - min) / (max - min);
  ctx.clearRect(0, 0, w, h);
  var side = Math.min(w, h), cx = w / 2, cy = h / 2;
  var outer = side * 0.46, inner = side * 0.36;
  ctx.lineCap = "butt";
  ctx.lineWidth = Math.max(2, side * 0.018);
  for (var i = 0; i < segments; i++) {
    var segFrac = i / (segments - 1);
    var angle = ((225 - 270 * segFrac) * Math.PI) / 180;
    var lit = segFrac <= frac && frac > 0;
    ctx.strokeStyle = lit ? zoneColor(segFrac) : THEME.DIM;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy - Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy - Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(Math.max(14, side * 0.19), true);
  ctx.fillStyle = frac > 0 ? zoneColor(frac) : THEME.TEXT_PRIMARY;
  ctx.fillText(v.toFixed(decimals || 0), cx, cy - side * 0.04);
  ctx.font = font(Math.max(9, side * 0.07), false);
  ctx.fillStyle = THEME.TEXT_SECONDARY;
  if (unit) ctx.fillText(unit, cx, cy + side * 0.13);
  if (label) ctx.fillText(label, cx, cy + side * 0.36);
}

function drawRpmStrip(ctx, w, h, rpm, maxRpm, flash) {
  var segments = 48, redlineFrom = 0.85;
  var frac = Math.max(0, Math.min(1, rpm / maxRpm));
  ctx.clearRect(0, 0, w, h);
  var textW = Math.max(64, w * 0.14);
  var stripW = w - textW;
  var gap = Math.max(1, (stripW / segments) * 0.28);
  var segW = (stripW - gap * (segments - 1)) / segments;
  var y0 = h * 0.2, y1 = h * 0.8;
  for (var i = 0; i < segments; i++) {
    var segFrac = i / (segments - 1);
    var lit = segFrac <= frac && frac > 0;
    var color;
    if (segFrac >= redlineFrom) color = lit ? THEME.NEGATIVE : THEME.REDLINE_DIM;
    else color = lit ? (flash ? THEME.NEGATIVE : THEME.TEXT_PRIMARY) : THEME.DIM;
    ctx.fillStyle = color;
    ctx.fillRect(i * (segW + gap), y0, segW, y1 - y0);
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = font(Math.max(11, h * 0.52), true);
  ctx.fillStyle = frac >= redlineFrom ? THEME.NEGATIVE : THEME.TEXT_PRIMARY;
  ctx.fillText(Math.round(rpm).toLocaleString("en-US"), w, h / 2);
}

function drawGear(ctx, w, h, g) {
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(Math.max(28, Math.min(w, h * 0.86) * 0.72), true);
  ctx.fillStyle = THEME.NEUTRAL;
  ctx.fillText(String(g), w / 2, h * 0.43);
  ctx.font = font(Math.max(9, h * 0.1), false);
  ctx.fillStyle = THEME.TEXT_SECONDARY;
  ctx.fillText("GEAR", w / 2, h * 0.93);
}

function drawPedals(ctx, w, h, throttle, brake) {
  ctx.clearRect(0, 0, w, h);
  var cols = [
    { frac: throttle, color: THEME.POSITIVE, label: "THR" },
    { frac: brake, color: THEME.NEGATIVE, label: "BRK" },
  ];
  var segments = 14;
  var labelH = Math.max(12, h * 0.14);
  var barH = h - labelH - 8;
  var gap = Math.max(1, (barH / segments) * 0.3);
  var segH = (barH - gap * (segments - 1)) / segments;
  var colW = w / cols.length;
  for (var c = 0; c < cols.length; c++) {
    var barW = Math.min(colW * 0.44, 30);
    var x0 = colW * c + (colW - barW) / 2;
    for (var i = 0; i < segments; i++) {
      var segFrac = (i + 1) / segments;
      var lit = segFrac <= cols[c].frac + 1e-9 && cols[c].frac > 0;
      var y = 8 + barH - (i + 1) * segH - i * gap;
      ctx.fillStyle = lit ? cols[c].color : THEME.DIM;
      ctx.fillRect(x0, y, barW, segH);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(Math.max(9, labelH * 0.62), false);
    ctx.fillStyle = THEME.TEXT_SECONDARY;
    ctx.fillText(cols[c].label, colW * c + colW / 2, h - labelH / 2);
  }
}

function drawTrace(ctx, w, h, series, capacity) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = THEME.GRID;
  ctx.lineWidth = 1;
  var fys = [0.25, 0.5, 0.75];
  for (var g = 0; g < fys.length; g++) {
    ctx.beginPath();
    ctx.moveTo(0, h * fys[g]);
    ctx.lineTo(w, h * fys[g]);
    ctx.stroke();
  }
  var pad = Math.max(2, h * 0.06);
  for (var s = 0; s < series.length; s++) {
    var data = series[s].data;
    if (data.length < 2) continue;
    ctx.strokeStyle = series[s].color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    var x0 = w - ((data.length - 1) / (capacity - 1)) * w;
    for (var i = 0; i < data.length; i++) {
      var x = x0 + (i / (capacity - 1)) * w;
      var fy = Math.max(0, Math.min(1, data[i]));
      var y = h - pad - fy * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/* ============================== Synthetic lap model ============================== */

/* Keyframed speed profile over one 26 s "lap": straights, brake zones,
 * corners. Everything else (pedals, gear, rpm, steering) derives from it. */
var SPEED_KEYS = [
  [0, 62], [3.2, 138], [5.4, 154], [6.6, 84], [9.0, 122],
  [11.4, 68], [13.2, 118], [15.6, 146], [17.4, 158], [18.8, 92],
  [21.2, 128], [23.4, 74], [26, 62],
];
var LAP_S = 26;
var GEARS = [[0, 42], [42, 68], [68, 96], [96, 124], [124, 150], [150, 200]];
var MAX_RPM = 7600;

function speedAt(t) {
  t = t % LAP_S;
  for (var i = 1; i < SPEED_KEYS.length; i++) {
    if (t <= SPEED_KEYS[i][0]) {
      var t0 = SPEED_KEYS[i - 1][0], v0 = SPEED_KEYS[i - 1][1];
      var t1 = SPEED_KEYS[i][0], v1 = SPEED_KEYS[i][1];
      var f = (t - t0) / (t1 - t0);
      f = f * f * (3 - 2 * f); /* smoothstep between keys */
      return v0 + (v1 - v0) * f;
    }
  }
  return SPEED_KEYS[0][1];
}

function modelAt(t) {
  var speed = speedAt(t);
  var slope = (speedAt(t + 0.18) - speedAt(t - 0.18)) / 0.36; /* mph/s */
  var throttle = Math.max(0, Math.min(1, 0.28 + slope / 26));
  var brake = Math.max(0, Math.min(1, -slope / 30));
  if (brake > 0.05) throttle = 0;

  var gearIndex = 0;
  for (var i = 0; i < GEARS.length; i++) {
    if (speed >= GEARS[i][0]) gearIndex = i;
  }
  var band = GEARS[gearIndex];
  var bandFrac = Math.max(0, Math.min(1, (speed - band[0]) / (band[1] - band[0])));
  var rpm = 2100 + bandFrac * (MAX_RPM - 2600) + Math.sin(t * 31) * 60;

  /* Steering: strongest where the profile is slow (corners), eased. */
  var slowness = Math.max(0, Math.min(1, (150 - speed) / 100));
  var steer = Math.sin(t * 1.35 + Math.sin(t * 0.41) * 2.2) * slowness;

  return {
    speed: speed,
    rpm: Math.max(1200, Math.min(MAX_RPM, rpm)),
    gear: gearIndex + 1,
    throttle: throttle,
    brake: brake,
    steer: steer,
  };
}

/* ============================== Demo loop ============================== */

(function demo() {
  var ids = ["g-rpm", "g-speed", "g-gear", "g-pedals", "g-trace"];
  var canvases = {};
  for (var i = 0; i < ids.length; i++) {
    canvases[ids[i]] = document.getElementById(ids[i]);
    if (!canvases[ids[i]]) return;
  }

  var CAP = 340;
  var thrBuf = [], brkBuf = [], strBuf = [];
  var visible = true;
  var start = performance.now();

  function frame(now) {
    var t = (now - start) / 1000;
    var m = modelAt(t);

    thrBuf.push(m.throttle);
    brkBuf.push(m.brake);
    strBuf.push(0.5 + m.steer * 0.42);
    if (thrBuf.length > CAP) { thrBuf.shift(); brkBuf.shift(); strBuf.shift(); }

    var flash = m.rpm >= MAX_RPM * 0.95 && Math.floor(t * 8) % 2 === 0;

    var f = fitCanvas(canvases["g-rpm"]);
    drawRpmStrip(f.ctx, f.w, f.h, m.rpm, MAX_RPM, flash);
    f = fitCanvas(canvases["g-speed"]);
    drawRadial(f.ctx, f.w, f.h, m.speed, 0, 180, "MPH", "SPEED", 0);
    f = fitCanvas(canvases["g-gear"]);
    drawGear(f.ctx, f.w, f.h, m.gear);
    f = fitCanvas(canvases["g-pedals"]);
    drawPedals(f.ctx, f.w, f.h, m.throttle, m.brake);
    f = fitCanvas(canvases["g-trace"]);
    drawTrace(f.ctx, f.w, f.h, [
      { data: thrBuf, color: THEME.POSITIVE },
      { data: brkBuf, color: THEME.NEGATIVE },
      { data: strBuf, color: THEME.STEER },
    ], CAP);

    if (visible && !document.hidden) requestAnimationFrame(frame);
  }

  function renderStatic() {
    /* One representative mid-corner-exit moment for reduced motion. */
    var m = modelAt(9.6);
    for (var t = 4.0; t < 9.6; t += 9.6 / CAP) {
      var s = modelAt(t);
      thrBuf.push(s.throttle);
      brkBuf.push(s.brake);
      strBuf.push(0.5 + s.steer * 0.42);
    }
    var f = fitCanvas(canvases["g-rpm"]);
    drawRpmStrip(f.ctx, f.w, f.h, m.rpm, MAX_RPM, false);
    f = fitCanvas(canvases["g-speed"]);
    drawRadial(f.ctx, f.w, f.h, m.speed, 0, 180, "MPH", "SPEED", 0);
    f = fitCanvas(canvases["g-gear"]);
    drawGear(f.ctx, f.w, f.h, m.gear);
    f = fitCanvas(canvases["g-pedals"]);
    drawPedals(f.ctx, f.w, f.h, m.throttle, m.brake);
    f = fitCanvas(canvases["g-trace"]);
    drawTrace(f.ctx, f.w, f.h, [
      { data: thrBuf, color: THEME.POSITIVE },
      { data: brkBuf, color: THEME.NEGATIVE },
      { data: strBuf, color: THEME.STEER },
    ], CAP);
  }

  if (REDUCED) {
    renderStatic();
    window.addEventListener("resize", renderStatic);
    return;
  }

  var card = document.querySelector(".demo-card");
  if ("IntersectionObserver" in window && card) {
    var io = new IntersectionObserver(function (entries) {
      var wasVisible = visible;
      visible = entries[0].isIntersecting;
      if (visible && !wasVisible) requestAnimationFrame(frame);
    }, { threshold: 0.05 });
    io.observe(card);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && visible) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
})();
