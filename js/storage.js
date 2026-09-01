/**
 * storage.js — Safe preference storage
 * Stores ONLY: music enabled, volume, puja-mode enabled, reduced-motion override.
 * Never stores personal data. If localStorage is unavailable (private
 * browsing, quota, disabled), every call fails silently and the app
 * falls back to sensible defaults — it never throws upward.
 */
const AppStorage = (() => {
  const KEY = "bfc:prefs:v1"; // Bengali Festival Countdown
  const DEFAULTS = {
    musicEnabled: false,
    volume: 0.6,
    pujaMode: false,
  };

  function isAvailable() {
    try {
      const t = "__bfc_test__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  const available = isAvailable();

  function load() {
    if (!available) return { ...DEFAULTS };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function save(prefs) {
    if (!available) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(prefs));
      return true;
    } catch (e) {
      return false;
    }
  }

  let state = load();

  return {
    get(key) {
      return state[key];
    },
    set(key, value) {
      state = { ...state, [key]: value };
      save(state);
    },
    getAll() {
      return { ...state };
    },
    isAvailable: () => available,
  };
})();

window.AppStorage = AppStorage;
