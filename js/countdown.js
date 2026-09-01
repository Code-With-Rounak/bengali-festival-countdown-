/**
 * countdown.js — Festival Countdown Engine
 * Pure logic, no DOM. Given "now", figures out:
 *   - which festival is live right now (if any)
 *   - which festival is next
 *   - time remaining to the relevant target
 *   - Mahalaya special mode
 *   - annual cycle wraparound (after the last festival, point at
 *     next year's first festival by re-running the same config
 *     with +1 year, since dates are lunisolar and NOT reusable
 *     as-is — see notes below)
 */
const CountdownEngine = (() => {
  function parse(dateStr) {
    return new Date(dateStr).getTime();
  }

  /**
   * Returns the ordered list of festivals with parsed timestamps.
   */
  function getScheduleMs() {
    return FESTIVALS.map((f) => ({
      ...f,
      startMs: parse(f.startDate),
      endMs: parse(f.endDate),
      mahalayaMs: f.mahalayaDate ? parse(f.mahalayaDate) : null,
    }));
  }

  /**
   * Core state resolver.
   * @param {number} nowMs
   * @returns {object} status descriptor
   */
  function resolve(nowMs) {
    const schedule = getScheduleMs();

    // 1. Is a festival LIVE right now?
    const live = schedule.find((f) => nowMs >= f.startMs && nowMs <= f.endMs);
    if (live) {
      return {
        status: "live",
        festival: live,
        targetMs: live.endMs,
        remainingMs: Math.max(0, live.endMs - nowMs),
        mahalaya: false,
      };
    }

    // 2. Is today Mahalaya (Durga Puja's special pre-day)?
    const durga = schedule.find((f) => f.id === "durga");
    if (durga && durga.mahalayaMs) {
      const oneDay = 24 * 60 * 60 * 1000;
      const isMahalayaDay =
        nowMs >= durga.mahalayaMs && nowMs < durga.mahalayaMs + oneDay;
      if (isMahalayaDay) {
        return {
          status: "mahalaya",
          festival: durga,
          targetMs: durga.startMs,
          remainingMs: Math.max(0, durga.startMs - nowMs),
          mahalaya: true,
        };
      }
    }

    // 3. Find the next UPCOMING festival (soonest startMs after now).
    const upcoming = schedule
      .filter((f) => f.startMs > nowMs)
      .sort((a, b) => a.startMs - b.startMs)[0];

    if (upcoming) {
      return {
        status: "upcoming",
        festival: upcoming,
        targetMs: upcoming.startMs,
        remainingMs: Math.max(0, upcoming.startMs - nowMs),
        mahalaya: false,
      };
    }

    // 4. Nothing left this year in the config: wrap to next year.
    //    Because these are lunisolar dates, we cannot just add 365
    //    days and call it correct — so we shift by 354–385 days
    //    (typical Bengali-calendar drift) ONLY as a rough on-screen
    //    placeholder, and rely on the developer having refreshed
    //    festivals.js with real dates before that day ever arrives.
    const first = schedule.sort((a, b) => a.startMs - b.startMs)[0];
    const approxNextYear = new Date(first.startMs);
    approxNextYear.setFullYear(approxNextYear.getFullYear() + 1);
    return {
      status: "cycle-reset",
      festival: first,
      targetMs: approxNextYear.getTime(),
      remainingMs: Math.max(0, approxNextYear.getTime() - nowMs),
      mahalaya: false,
      needsConfigUpdate: true,
    };
  }

  function breakdown(remainingMs) {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }

  /**
   * Progress from the "waiting" starting point to the target, 0–100.
   * For "upcoming": progress since the previous festival's end (or
   * Mahalaya, or app-install day, whichever is latest) toward start.
   * For "live": progress through the live window itself.
   */
  function progressPercent(nowMs, status) {
    if (status.status === "live") {
      const total = status.festival.endMs - status.festival.startMs;
      const done = nowMs - status.festival.startMs;
      return total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 100;
    }
    if (status.status === "mahalaya") {
      const total = status.festival.startMs - status.festival.mahalayaMs;
      const done = nowMs - status.festival.mahalayaMs;
      return total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
    }
    // upcoming / cycle-reset: anchor the "wait began" point at the
    // previous festival's end (schedule order), else 30 days before target.
    const schedule = getScheduleMs().sort((a, b) => a.startMs - b.startMs);
    const idx = schedule.findIndex((f) => f.id === status.festival.id);
    const prev = idx > 0 ? schedule[idx - 1] : null;
    const anchor = prev ? prev.endMs : status.targetMs - 30 * 86400000;
    const total = status.targetMs - anchor;
    const done = nowMs - anchor;
    return total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  }

  return { resolve, breakdown, progressPercent, getScheduleMs };
})();

window.CountdownEngine = CountdownEngine;
