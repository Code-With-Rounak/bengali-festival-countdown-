/**
 * festivals.js — Central Festival Configuration
 * ============================================================
 * EDIT THIS FILE ONCE A YEAR. Every date below is the ONLY place
 * dates live in the whole app. Nothing else hardcodes a date.
 *
 * Bengali festival dates follow the lunisolar Panjika calendar,
 * so they shift every year — they are NOT fixed Gregorian dates.
 * Look them up fresh each year (a purohit's panjika, or a site
 * like drikpanchang.com) and update the arrays below.
 *
 * Each festival has:
 *   - mahalayaDate  (Durga Puja only — the "countdown begins" day)
 *   - startDate      the first main day (countdown target)
 *   - endDate         the last main day (festival is "live" between
 *                     startDate 00:00 and endDate 23:59:59, IST)
 *
 * Dates used below (verified against multiple panjika sources,
 * Asia/Kolkata), in chronological order from today:
 *   Mahalaya                — 10 Oct 2026
 *   Durga Puja (Shashthi→Vijaya Dashami) — 17–21 Oct 2026
 *   Kojagari Lakshmi Puja    — 25 Oct 2026
 *   Kali Puja                — 8 Nov 2026
 *   Jagaddhatri Puja (Shashthi→Dashami) — 16–19 Nov 2026 (Navami 18 Nov)
 *   Saraswati Puja / Vasant Panchami    — 11 Feb 2027 (2026's already passed)
 *   Pohela Boishakh (Bengali New Year)  — 15 Apr 2027 (India/West Bengal;
 *                                          Bangladesh observes 14 Apr — see
 *                                          note on that festival below)
 * ============================================================
 */

const FESTIVALS = [
  {
    id: "durga",
    name: "Durga Puja",
    bengaliName: "দুর্গাপূজা",
    greeting: "শুভ শারদীয়া",
    mahalayaDate: "2026-10-10T00:00:00+05:30",
    startDate: "2026-10-17T00:00:00+05:30", // Maha Shashthi
    endDate: "2026-10-21T23:59:59+05:30",   // Vijaya Dashami
    description:
      "মা দুর্গার আগমনের উৎসব — শক্তি, ভক্তি ও ঘরে ফেরার আনন্দ।",
    waitingMessages: [
      "মা আসছেন...",
      "শারদীয়ার অপেক্ষায়...",
      "আর কটা দিন...",
      "কাশফুল দুলছে, পুজোর গন্ধ আসছে...",
      "ঢাকের আওয়াজ শোনা যাচ্ছে দূর থেকে...",
    ],
    liveMessages: [
      "🎉 আজ পুজো!",
      "মা এসেছেন, ঘরে ঘরে আনন্দ...",
      "ঢাকের তালে মন নেচে ওঠে...",
    ],
    timeline: ["মহালয়া", "ষষ্ঠী", "সপ্তমী", "অষ্টমী", "নবমী", "দশমী"],
    // Day boundaries inside the live window, used to highlight "today" on the timeline.
    timelineDates: [
      "2026-10-10", // মহালয়া
      "2026-10-17", // ষষ্ঠী
      "2026-10-18", // সপ্তমী
      "2026-10-19", // অষ্টমী
      "2026-10-20", // নবমী
      "2026-10-21", // দশমী
    ],
    theme: {
      colors: {
        primary: "#7a1f2b",
        secondary: "#d4af37",
        accent: "#e8743b",
        surface: "#fbeedd",
        glow: "rgba(232, 116, 59, 0.45)",
      },
    },
    images: {
      morning: "assets/images/durga/morning.png",
      afternoon: "assets/images/durga/afternoon.png",
      evening: "assets/images/durga/evening.png",
      night: "assets/images/durga/night.png",
    },
    // Special one-off track that plays only during Mahalaya (the single
    // day before Durga Puja itself begins). See app.js / audio.js —
    // it's picked automatically when CountdownEngine reports "mahalaya".
    mahalayaAudio: "assets/audio/mahalaya.mp3",
    // Durga Puja plays three songs back-to-back (chained, then loops the
    // list) instead of one. Any festival's `audio` can be a single string
    // OR an array like this — audio.js handles both automatically.
    audio: [
      "assets/audio/durga-1.mp3",
      "assets/audio/durga-2.mp3",
      "assets/audio/durga-3.mp3",
    ],
    particle: "petal", // kash-flower / petal drift
  },
  {
    id: "lakshmi",
    name: "Lakshmi Puja",
    bengaliName: "লক্ষ্মীপূজা",
    greeting: "শুভ লক্ষ্মীপূজা",
    startDate: "2026-10-25T00:00:00+05:30", // Kojagari Purnima
    endDate: "2026-10-25T23:59:59+05:30",
    description: "কোজাগরী পূর্ণিমার রাতে দেবী লক্ষ্মীর আরাধনা।",
    waitingMessages: [
      "শুভ লক্ষ্মীপূজার অপেক্ষায়...",
      "আলোর উৎসবের অপেক্ষায়...",
      "উঠোনে আলপনা আঁকার পালা...",
      "পূর্ণিমার চাঁদ উঠবে শীঘ্রই...",
    ],
    liveMessages: [
      "🎉 আজ লক্ষ্মীপূজা!",
      "মা লক্ষ্মী গৃহে বিরাজ করছেন...",
      "কে জাগে? — কোজাগরী রাত...",
    ],
    timeline: ["দশমীর পরে", "কোজাগরী পূর্ণিমা"],
    timelineDates: ["2026-10-21", "2026-10-25"],
    theme: {
      colors: {
        primary: "#b33a3a",
        secondary: "#e8c468",
        accent: "#e88aa0",
        surface: "#fff8ed",
        glow: "rgba(232, 196, 104, 0.45)",
      },
    },
    images: {
      morning: "assets/images/lakshmi/morning.png",
      afternoon: "assets/images/lakshmi/afternoon.png",
      evening: "assets/images/lakshmi/evening.png",
      night: "assets/images/lakshmi/night.png",
    },
    audio: "assets/audio/lakshmi.mp3",
    particle: "diya-glow",
  },
  {
    id: "kali",
    name: "Kali Puja",
    bengaliName: "কালীপূজা",
    greeting: "শুভ কালীপূজা",
    startDate: "2026-11-08T00:00:00+05:30",
    endDate: "2026-11-08T23:59:59+05:30",
    description: "কার্তিক অমাবস্যায় দেবী কালীর আরাধনা।",
    waitingMessages: [
      "শুভ কালীপূজার অপেক্ষায়...",
      "অমাবস্যার রাত ঘনিয়ে আসছে...",
      "প্রদীপ জ্বালাবার প্রস্তুতি চলছে...",
    ],
    liveMessages: [
      "🎉 আজ কালীপূজা!",
      "মা কালী পূজিত হচ্ছেন...",
      "অমাবস্যার আলোয় আরাধনা...",
    ],
    timeline: ["ভূত চতুর্দশী", "কালীপূজা"],
    timelineDates: ["2026-11-07", "2026-11-08"],
    theme: {
      colors: {
        primary: "#1b1035",
        secondary: "#c9a227",
        accent: "#8c1c3a",
        surface: "#efe6ff",
        glow: "rgba(201, 162, 39, 0.4)",
      },
    },
    images: {
      morning: "assets/images/kali/morning.png",
      afternoon: "assets/images/kali/afternoon.png",
      evening: "assets/images/kali/evening.png",
      night: "assets/images/kali/night.png",
    },
    audio: "assets/audio/kali.mp3",
    particle: "starlight",
  },
  {
    id: "jagaddhatri",
    name: "Jagaddhatri Puja",
    bengaliName: "জগদ্ধাত্রী পূজা",
    greeting: "শুভ জগদ্ধাত্রী পূজা",
    startDate: "2026-11-16T00:00:00+05:30", // Shashthi
    endDate: "2026-11-19T23:59:59+05:30",   // Dashami
    description:
      "কার্তিক মাসের শুক্লা নবমীতে দেবী জগদ্ধাত্রীর আরাধনা — চন্দননগরের আলোকসজ্জার উৎসব।",
    waitingMessages: [
      "শুভ জগদ্ধাত্রী পূজার অপেক্ষায়...",
      "চন্দননগরের আলোর সাজ প্রস্তুত হচ্ছে...",
      "কার্তিকের নবমীর অপেক্ষায়...",
    ],
    liveMessages: [
      "🎉 আজ জগদ্ধাত্রী পূজা!",
      "মা জগদ্ধাত্রী পূজিত হচ্ছেন...",
      "আলোকসজ্জায় সেজেছে চন্দননগর...",
    ],
    timeline: ["ষষ্ঠী", "সপ্তমী", "অষ্টমী", "নবমী"],
    timelineDates: ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"],
    theme: {
      colors: {
        primary: "#6b2f14",
        secondary: "#f2c14e",
        accent: "#ff7f3f",
        surface: "#fff4e0",
        glow: "rgba(255, 127, 63, 0.45)",
      },
    },
    images: {
      morning: "assets/images/jagaddhatri/morning.png",
      afternoon: "assets/images/jagaddhatri/afternoon.png",
      evening: "assets/images/jagaddhatri/evening.png",
      night: "assets/images/jagaddhatri/night.png",
    },
    audio: "assets/audio/jagaddhatri.mp3",
    particle: "petal",
  },
  {
    id: "saraswati",
    name: "Saraswati Puja",
    bengaliName: "সরস্বতী পূজা",
    greeting: "শুভ সরস্বতী পূজা",
    startDate: "2027-02-11T00:00:00+05:30", // Vasant Panchami
    endDate: "2027-02-11T23:59:59+05:30",
    description: "মাঘ মাসের শুক্লা পঞ্চমীতে বিদ্যার দেবী সরস্বতীর আরাধনা।",
    waitingMessages: [
      "শুভ সরস্বতী পূজার অপেক্ষায়...",
      "বসন্ত পঞ্চমীর অপেক্ষায়...",
      "পলাশ ফুল ফুটছে, বসন্ত আসছে...",
      "খাতা-কলম গুছিয়ে রাখার পালা...",
    ],
    liveMessages: [
      "🎉 আজ সরস্বতী পূজা!",
      "মা সরস্বতী পূজিত হচ্ছেন...",
      "বীণাপাণির আরাধনায় মুখর প্রাঙ্গণ...",
    ],
    timeline: ["বসন্ত পঞ্চমী"],
    timelineDates: ["2027-02-11"],
    theme: {
      colors: {
        primary: "#c98a1a",
        secondary: "#fef3c7",
        accent: "#7fb8bd",
        surface: "#fffdf5",
        glow: "rgba(127, 184, 189, 0.4)",
      },
    },
    images: {
      morning: "assets/images/saraswati/morning.png",
      afternoon: "assets/images/saraswati/afternoon.png",
      evening: "assets/images/saraswati/evening.png",
      night: "assets/images/saraswati/night.png",
    },
    audio: "assets/audio/saraswati.mp3",
    particle: "petal",
  },
  {
    id: "pohela-boishakh",
    name: "Pohela Boishakh",
    bengaliName: "পহেলা বৈশাখ",
    greeting: "শুভ নববর্ষ",
    // India / West Bengal convention (15 April 2027). Bangladesh's Bangla
    // Academy calendar fixes this on 14 April every year — if you're
    // building for a Bangladesh audience, shift this one day earlier.
    startDate: "2027-04-15T00:00:00+05:30",
    endDate: "2027-04-15T23:59:59+05:30",
    description: "বাংলা নববর্ষ — নতুন বছরের প্রথম দিন, নতুন আশার সূচনা।",
    waitingMessages: [
      "শুভ নববর্ষের অপেক্ষায়...",
      "হালখাতার প্রস্তুতি চলছে...",
      "নতুন বছরের অপেক্ষায় মন উচাটন...",
    ],
    liveMessages: [
      "🎉 শুভ নববর্ষ!",
      "নতুন বছর, নতুন আশা...",
      "মঙ্গল শোভাযাত্রায় মুখর পথঘাট...",
    ],
    timeline: ["পহেলা বৈশাখ"],
    timelineDates: ["2027-04-15"],
    theme: {
      colors: {
        primary: "#b91c1c",
        secondary: "#fdf6ec",
        accent: "#2f9e44",
        surface: "#fff8f0",
        glow: "rgba(47, 158, 68, 0.4)",
      },
    },
    images: {
      morning: "assets/images/pohela-boishakh/morning.png",
      afternoon: "assets/images/pohela-boishakh/afternoon.png",
      evening: "assets/images/pohela-boishakh/evening.png",
      night: "assets/images/pohela-boishakh/night.png",
    },
    audio: "assets/audio/pohela-boishakh.mp3",
    particle: "diya-glow",
  },
];

// Time-of-day windows (IST). "night" wraps past midnight.
const TIME_PERIODS = [
  { id: "morning", start: 5, end: 12 },
  { id: "afternoon", start: 12, end: 16 },
  { id: "evening", start: 16, end: 19 },
  { id: "night", start: 19, end: 29 }, // 19:00 → 05:00 next day (29 = 24+5)
];

// Exposed for other modules (no bundler in use — plain globals by design,
// per project constraint: vanilla JS, no build step).
window.FESTIVALS = FESTIVALS;
window.TIME_PERIODS = TIME_PERIODS;
