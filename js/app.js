/**
 * app.js — Wires everything together and drives the render loop.
 */
(function () {
  "use strict";

  let els = {};
  let tickId = null;
  let lastStatusKey = null; // detects festival/status transitions
  let lastDay = null; // detects midnight rollover for date label refresh
  let messageRotateId = null;

  function cacheEls() {
    els = {
      greeting: document.getElementById("festival-greeting"),
      bengaliDate: document.getElementById("bengali-date"),
      statusPill: document.getElementById("status-pill"),
      message: document.getElementById("rotating-message"),
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      minutes: document.getElementById("cd-minutes"),
      seconds: document.getElementById("cd-seconds"),
      progressBar: document.getElementById("progress-bar-fill"),
      progressLabel: document.getElementById("progress-label"),
      timeline: document.getElementById("puja-timeline"),
      musicToggle: document.getElementById("music-toggle"),
      nextTrackBtn: document.getElementById("next-track-btn"),
      volumeSlider: document.getElementById("volume-slider"),
      shareBtn: document.getElementById("share-btn"),
      pujaModeToggle: document.getElementById("puja-mode-toggle"),
      transitionOverlay: document.getElementById("transition-overlay"),
      transitionText: document.getElementById("transition-text"),
      liveRegion: document.getElementById("sr-live-region"),
    };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function render() {
    const now = new Date();
    const nowMs = now.getTime();
    const status = CountdownEngine.resolve(nowMs);
    const statusKey = `${status.festival.id}:${status.status}`;

    if (statusKey !== lastStatusKey) {
      handleTransition(lastStatusKey, statusKey, status);
      lastStatusKey = statusKey;
    }

    // Countdown digits
    const t = CountdownEngine.breakdown(status.remainingMs);
    setDigit(els.days, t.days);
    setDigit(els.hours, pad(t.hours));
    setDigit(els.minutes, pad(t.minutes));
    setDigit(els.seconds, pad(t.seconds));

    // Zero-reached celebration (fires once per transition, handled above too,
    // but also catch the exact tick it hits zero for a live festival start).
    if (status.remainingMs <= 0 && status.status === "upcoming") {
      // Will resolve to "live" on next tick; nothing else to do here.
    }

    // Progress bar
    const pct = CountdownEngine.progressPercent(nowMs, status);
    els.progressBar.style.width = `${pct.toFixed(1)}%`;
    els.progressBar.setAttribute("aria-valuenow", pct.toFixed(0));

    // Bengali date (refresh once per day is enough, but cheap to set every tick)
    const day = now.toDateString();
    if (day !== lastDay) {
      els.bengaliDate.textContent = ThemeEngine.getISTDateLabel(now);
      lastDay = day;
    }

    // Theme + background
    ThemeEngine.update(status.festival);
  }

  function setDigit(el, value) {
    if (el.textContent !== String(value)) {
      el.textContent = value;
      el.classList.remove("digit-pulse");
      // Force reflow so the animation can re-trigger every change.
      void el.offsetWidth;
      el.classList.add("digit-pulse");
    }
  }

  function handleTransition(prevKey, newKey, status) {
    updateGreeting(status.festival);
    updateStatusPill(status);
    updateProgressLabel(status);
    updateTimeline(status);
    Effects.setMode(status.festival.particle);
    AudioEngine.setFestivalAudio(status.festival, status.status === "mahalaya");
    els.nextTrackBtn.hidden = !AudioEngine.hasMultipleTracks();
    rotateMessages(status);
    announce(`${status.festival.name} — ${statusLabel(status)}`);

    if (prevKey !== null) {
      playFestivalTransition(status.festival);
    }
  }

  function statusLabel(status) {
    if (status.status === "live") return "আজ পুজো!";
    if (status.status === "mahalaya") return "শুভ মহালয়া";
    return "অপেক্ষা চলছে";
  }

  function updateGreeting(festival) {
    els.greeting.textContent = festival.greeting;
  }

  function updateStatusPill(status) {
    els.statusPill.textContent = statusLabel(status);
    els.statusPill.setAttribute("data-state", status.status);
  }

  function updateProgressLabel(status) {
    const labels = {
      live: "উৎসব চলছে",
      mahalaya: "মায়ের আগমনের অপেক্ষা",
      upcoming: "মায়ের আগমনের অপেক্ষা",
      "cycle-reset": "পরের বছরের প্রতীক্ষায়",
    };
    els.progressLabel.textContent = `${labels[status.status]} — ${status.festival.name}`;
  }

  function updateTimeline(status) {
    const f = status.festival;
    els.timeline.innerHTML = "";
    if (!f.timeline || !f.timelineDates) return;

    const now = new Date();
    const todayIST = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(now); // YYYY-MM-DD

    f.timeline.forEach((label, i) => {
      const li = document.createElement("li");
      li.className = "timeline-step";
      li.textContent = label;
      if (f.timelineDates[i] === todayIST) {
        li.classList.add("timeline-today");
        li.setAttribute("aria-current", "date");
      } else if (f.timelineDates[i] < todayIST) {
        li.classList.add("timeline-past");
      }
      els.timeline.appendChild(li);
    });
  }

  function rotateMessages(status) {
    if (messageRotateId) clearInterval(messageRotateId);
    const pool =
      status.status === "live" ? status.festival.liveMessages : status.festival.waitingMessages;
    let idx = 0;
    els.message.textContent = pool[0];
    messageRotateId = setInterval(() => {
      idx = (idx + 1) % pool.length;
      els.message.style.opacity = "0";
      setTimeout(() => {
        els.message.textContent = pool[idx];
        els.message.style.opacity = "1";
      }, 400);
    }, 9000);
  }

  function playFestivalTransition(festival) {
    const overlay = els.transitionOverlay;
    const text = els.transitionText;
    text.textContent = `${festival.greeting} শুরু হচ্ছে...`;
    overlay.classList.add("transition-active");
    window.setTimeout(() => {
      overlay.classList.remove("transition-active");
    }, 2200);
  }

  function announce(msg) {
    els.liveRegion.textContent = msg;
  }

  // --- Controls ---
  function wireControls() {
    els.musicToggle.addEventListener("click", () => {
      const on = AudioEngine.toggle();
      els.musicToggle.setAttribute("aria-pressed", String(on));
      els.musicToggle.textContent = on ? "🔊 সঙ্গীত চলছে" : "🔈 সঙ্গীত চালু করুন";
    });

    els.volumeSlider.addEventListener("input", (e) => {
      AudioEngine.setVolume(parseFloat(e.target.value));
    });

    document.addEventListener("audio:unavailable", () => {
      els.musicToggle.disabled = true;
      els.musicToggle.textContent = "🔈 সঙ্গীত উপলব্ধ নেই";
    });
    document.addEventListener("audio:blocked", () => {
      els.musicToggle.setAttribute("aria-pressed", "false");
      els.musicToggle.textContent = "🔈 সঙ্গীত চালু করুন";
    });
    document.addEventListener("audio:playlist-changed", (e) => {
      els.nextTrackBtn.hidden = !e.detail.multiple;
    });
    els.nextTrackBtn.addEventListener("click", () => {
      AudioEngine.nextTrack();
    });

    els.pujaModeToggle.addEventListener("click", () => {
      const active = document.body.classList.toggle("puja-mode");
      AppStorage.set("pujaMode", active);
      els.pujaModeToggle.setAttribute("aria-pressed", String(active));
      if (active) announce("পূজা মোড চালু হয়েছে");
    });

    els.shareBtn.addEventListener("click", onShare);
  }

  async function onShare() {
    const status = CountdownEngine.resolve(Date.now());
    const text = `${status.festival.greeting}! পুজোর অপেক্ষা শুরু হয়েছে। তুমি কতদিন ধরে অপেক্ষা করছ?`;
    const shareData = { title: "Bengali Festival Countdown", text, url: location.href };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        /* user cancelled — no-op */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${location.href}`);
      announce("লিংক কপি হয়েছে");
      flashShareFeedback();
    } catch (e) {
      announce("শেয়ার করা যায়নি");
    }
  }

  function flashShareFeedback() {
    const original = els.shareBtn.textContent;
    els.shareBtn.textContent = "✅ কপি হয়েছে";
    window.setTimeout(() => {
      els.shareBtn.textContent = original;
    }, 1800);
  }

  function restorePrefs() {
    if (AppStorage.get("pujaMode")) {
      document.body.classList.add("puja-mode");
      els.pujaModeToggle.setAttribute("aria-pressed", "true");
    }
    els.volumeSlider.value = AppStorage.get("volume");
    if (AudioEngine.isEnabled()) {
      els.musicToggle.setAttribute("aria-pressed", "true");
      els.musicToggle.textContent = "🔊 সঙ্গীত চলছে";
    }
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {
          /* offline support is optional — site works without it */
        });
      });
    }
  }

  function start() {
    cacheEls();
    ThemeEngine.init();
    AudioEngine.init();
    Effects.init();
    wireControls();
    restorePrefs();
    render();
    Effects.start();
    tickId = setInterval(render, 1000);
    registerServiceWorker();
  }

  document.addEventListener("DOMContentLoaded", start);

  // Clean up timers if the page is torn down (helps in embedded/webview contexts).
  window.addEventListener("pagehide", () => {
    if (tickId) clearInterval(tickId);
    if (messageRotateId) clearInterval(messageRotateId);
  });
})();
