/**
 * effects.js — Lightweight ambient particles + interactive diya
 * All animation uses CSS transforms driven by requestAnimationFrame,
 * respects prefers-reduced-motion, and pauses entirely when the tab
 * is hidden (Page Visibility API) to save battery/CPU on mobile.
 */
const Effects = (() => {
  let canvas, ctx, rafId = null;
  let particles = [];
  let mode = "petal";
  let running = false;
  let reducedMotion = false;

  const MAX_PARTICLES = 26; // deliberately small for low-end Android

  /** Reads the current festival's CSS custom property so particle
   *  colors follow theme.js automatically — new festivals never need
   *  a new particle mode, just a theme, to look right. */
  function themeColor(varName, fallbackRgb) {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (!raw) return fallbackRgb;
    const hex = raw.replace("#", "");
    if (hex.length !== 6) return fallbackRgb;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return fallbackRgb;
    return `${r},${g},${b}`;
  }

  function init() {
    canvas = document.getElementById("effects-canvas");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize, { passive: true });

    reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .addEventListener("change", (e) => {
        reducedMotion = e.matches;
        if (reducedMotion) stop();
        else start();
      });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseLoop();
      else if (running && !reducedMotion) resumeLoop();
    });

    initDiya();
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seed() {
    particles = [];
    if (reducedMotion) return;
    const count = mode === "starlight" ? 40 : MAX_PARTICLES;
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(true));
    }
  }

  function makeParticle(randomY) {
    const w = canvas.width;
    const h = canvas.height;
    if (mode === "petal") {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -20,
        r: 4 + Math.random() * 5,
        vy: 0.3 + Math.random() * 0.5,
        vx: Math.sin(Math.random() * Math.PI) * 0.4,
        sway: Math.random() * Math.PI * 2,
        color: `rgba(${themeColor("--color-accent", "232,116,59")},0.55)`,
      };
    }
    if (mode === "diya-glow") {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 20,
        r: 2 + Math.random() * 3,
        vy: -(0.2 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.15,
        flicker: Math.random() * Math.PI * 2,
        color: `rgba(${themeColor("--color-secondary", "232,196,104")},0.8)`,
      };
    }
    // starlight
    return {
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      r: 0.6 + Math.random() * 1.4,
      twinkle: Math.random() * Math.PI * 2,
      color: `rgba(${themeColor("--color-secondary", "201,162,39")},0.9)`,
    };
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    particles.forEach((p) => {
      if (mode === "petal") {
        p.sway += 0.02;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.3;
        if (p.y > h + 10) Object.assign(p, makeParticle(false));
      } else if (mode === "diya-glow") {
        p.flicker += 0.08;
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) Object.assign(p, makeParticle(false));
      } else {
        p.twinkle += 0.03;
      }
      drawParticle(p);
    });

    rafId = requestAnimationFrame(step);
  }

  function drawParticle(p) {
    ctx.beginPath();
    if (mode === "starlight") {
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(p.twinkle));
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
    } else if (mode === "diya-glow") {
      const alpha = 0.5 + 0.5 * Math.abs(Math.sin(p.flicker));
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha})`);
    } else {
      ctx.fillStyle = p.color;
    }
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function setMode(newMode) {
    mode = newMode;
    seed();
  }

  function start() {
    if (reducedMotion) return;
    running = true;
    seed();
    resumeLoop();
  }

  function stop() {
    running = false;
    pauseLoop();
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function pauseLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resumeLoop() {
    if (!rafId && running) rafId = requestAnimationFrame(step);
  }

  // --- Interactive diya (req #13) ---
  function initDiya() {
    const diya = document.getElementById("interactive-diya");
    if (!diya) return;
    const flame = diya.querySelector(".diya-flame");

    const ignite = () => {
      diya.classList.add("diya-lit");
      spawnRisingSparks(diya);
      window.clearTimeout(diya._timer);
      diya._timer = window.setTimeout(() => {
        diya.classList.remove("diya-lit");
      }, 1800);
    };

    diya.addEventListener("click", ignite);
    diya.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ignite();
      }
    });
  }

  function spawnRisingSparks(diya) {
    if (reducedMotion) return;
    const rect = diya.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 10,
        y: rect.top,
        r: 1.5,
        vy: -(0.6 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 0.4,
        flicker: Math.random() * Math.PI * 2,
        color: "rgba(232,196,104,0.85)",
        _spark: true,
        life: 60,
      });
    }
  }

  return { init, setMode, start, stop };
})();

window.Effects = Effects;
