/**
 * audio.js — Festival ambience playback
 * Never autoplays with sound (browsers block it anyway, and it's
 * respectful UX). Only starts once the user presses "Play Festival
 * Music" or has previously enabled it in this session's preferences.
 * If the audio file is missing/blocked, the control degrades to a
 * disabled state instead of throwing.
 */
const AudioEngine = (() => {
  let player;
  let currentSrc = null;
  let enabled = false;
  let available = true;

  // Support for a festival having several tracks (e.g. Durga Puja's
  // three songs) plus one special one-off track (Mahalaya).
  let trackList = []; // the *current* festival's playable list, 1+ items
  let trackIndex = 0;

  function init() {
    player = document.getElementById("festival-audio");
    player.volume = AppStorage.get("volume");
    player.addEventListener("error", () => {
      available = false;
      document.dispatchEvent(new CustomEvent("audio:unavailable"));
    });
    // When a track finishes, loop within the list: if there's more than
    // one track, move to the next one instead of repeating the same file.
    player.addEventListener("ended", () => {
      if (trackList.length > 1) {
        trackIndex = (trackIndex + 1) % trackList.length;
        playCurrent();
      }
    });
    enabled = !!AppStorage.get("musicEnabled");
  }

  function playCurrent() {
    const src = trackList[trackIndex];
    if (!src) return;
    currentSrc = src;
    player.loop = trackList.length <= 1; // loop single tracks, chain multiple
    player.src = src;
    if (enabled) {
      player.play().catch(() => {
        enabled = false;
        AppStorage.set("musicEnabled", false);
        document.dispatchEvent(new CustomEvent("audio:blocked"));
      });
    }
  }

  /**
   * Sets the active playlist for the current render, given the resolved
   * festival object and whether today is the Mahalaya special day.
   * - Mahalaya: plays `festival.mahalayaAudio` alone, if present.
   * - Otherwise: plays `festival.audio`, which can be a single path
   *   (string) or a list of paths (array) — Durga Puja uses an array
   *   of three tracks; every other festival still uses one.
   */
  function setFestivalAudio(festival, isMahalaya) {
    if (!available) return;

    let nextList;
    if (isMahalaya && festival.mahalayaAudio) {
      nextList = [festival.mahalayaAudio];
    } else if (Array.isArray(festival.audio)) {
      nextList = festival.audio;
    } else {
      nextList = [festival.audio];
    }

    // Avoid restarting playback if nothing actually changed.
    const sameList =
      nextList.length === trackList.length &&
      nextList.every((s, i) => s === trackList[i]);
    if (sameList) return;

    trackList = nextList;
    trackIndex = 0;
    playCurrent();
    document.dispatchEvent(
      new CustomEvent("audio:playlist-changed", {
        detail: { multiple: trackList.length > 1 },
      })
    );
  }

  /** Manually skip to the next track (for the "পরের গান" control). */
  function nextTrack() {
    if (trackList.length <= 1) return;
    trackIndex = (trackIndex + 1) % trackList.length;
    playCurrent();
  }

  function hasMultipleTracks() {
    return trackList.length > 1;
  }

  function toggle() {
    if (!available) return false;
    if (enabled) {
      player.pause();
      enabled = false;
    } else {
      player.play().catch(() => {
        document.dispatchEvent(new CustomEvent("audio:blocked"));
      });
      enabled = true;
    }
    AppStorage.set("musicEnabled", enabled);
    return enabled;
  }

  function setVolume(v) {
    const clamped = Math.min(1, Math.max(0, v));
    if (player) player.volume = clamped;
    AppStorage.set("volume", clamped);
  }

  function isEnabled() {
    return enabled;
  }

  function isAvailable() {
    return available;
  }

  return {
    init,
    setFestivalAudio,
    nextTrack,
    hasMultipleTracks,
    toggle,
    setVolume,
    isEnabled,
    isAvailable,
  };
})();

window.AudioEngine = AudioEngine;
