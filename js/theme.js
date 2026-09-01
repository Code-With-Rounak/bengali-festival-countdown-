/**
 * theme.js — Background + color theme engine
 * Determines the current IST time-of-day period and applies the
 * matching festival background with a smooth crossfade, plus pushes
 * the festival's color tokens into CSS custom properties.
 */
const ThemeEngine = (() => {
  let layerA, layerB, activeLayer;
  let currentKey = null; // `${festivalId}:${period}`

  function init() {
    layerA = document.getElementById("bg-layer-a");
    layerB = document.getElementById("bg-layer-b");
    activeLayer = layerA;
  }

  /**
   * Returns 'morning' | 'afternoon' | 'evening' | 'night' based on
   * the current hour in Asia/Kolkata, independent of the visitor's
   * own timezone.
   */
  function getISTPeriod(date = new Date()) {
    const istString = date.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const [hourStr, minuteStr] = istString.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const fractionalHour = hour + minute / 60;

    for (const period of TIME_PERIODS) {
      if (period.id === "night") {
        // night wraps midnight: 19:00–24:00 or 0:00–5:00
        if (fractionalHour >= period.start || fractionalHour < 5) return "night";
      } else if (fractionalHour >= period.start && fractionalHour < period.end) {
        return period.id;
      }
    }
    return "night";
  }

  function getISTDateLabel(date = new Date()) {
    try {
      return new Intl.DateTimeFormat("bn-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return date.toDateString();
    }
  }

  /** Applies a festival's color tokens as CSS custom properties. */
  function applyColors(festival) {
    const root = document.documentElement;
    const c = festival.theme.colors;
    root.style.setProperty("--color-primary", c.primary);
    root.style.setProperty("--color-secondary", c.secondary);
    root.style.setProperty("--color-accent", c.accent);
    root.style.setProperty("--color-surface", c.surface);
    root.style.setProperty("--color-glow", c.glow);
    document.body.setAttribute("data-festival", festival.id);
  }

  /**
   * Crossfades to the background for (festival, period).
   * Uses two stacked layers; the incoming layer fades in over the
   * outgoing one. Falls back to a themed CSS gradient (defined in
   * style.css per data-festival/data-period) if the image 404s, so
   * a missing asset never breaks the page.
   */
  function setBackground(festival, period) {
    const key = `${festival.id}:${period}`;
    if (key === currentKey) return;
    currentKey = key;

    const incoming = activeLayer === layerA ? layerB : layerA;
    const outgoing = activeLayer;

    incoming.setAttribute("data-festival", festival.id);
    incoming.setAttribute("data-period", period);

    const src = festival.images[period];
    const img = new Image();
    img.onload = () => {
      incoming.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url("${src}")`;
      crossfade();
    };
    img.onerror = () => {
      // Graceful fallback: no image asset present yet — rely on the
      // CSS gradient already defined for [data-festival][data-period].
      incoming.style.backgroundImage = "";
      crossfade();
    };
    img.src = src;

    function crossfade() {
      incoming.style.opacity = "1";
      outgoing.style.opacity = "0";
      activeLayer = incoming;
    }
  }

  function update(festival) {
    const period = getISTPeriod();
    applyColors(festival);
    setBackground(festival, period);
    document.body.setAttribute("data-period", period);
    return period;
  }

  return { init, getISTPeriod, getISTDateLabel, applyColors, setBackground, update };
})();

window.ThemeEngine = ThemeEngine;
