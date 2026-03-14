import { useState, useCallback, useEffect, useMemo, useRef } from "react";

// --- Types ---

interface SlotDef {
  id: string;
  w: number;
}

interface SpacerDef {
  id: string;
  w: number;
  spacer: true;
}

type BoardItem = SlotDef | SpacerDef;

interface KeyDef {
  id: string;
  label: string;
  w: number;
}

type LayoutName = "qwerty" | "dvorak" | "colemak";

type PlatformName = "windows" | "mac";

type ThemeName = "light" | "dark" | "retro";

interface ThemeColors {
  page: string;
  title: string;
  subtitle: string;
  board: string;
  slotEmpty: string;
  slotEmptyBorder: string;
  slotDragOver: string;
  slotDragOverBorder: string;
  poolBg: string;
  poolLabel: string;
  keycap: { bg: string; border: string; text: string; shadow: string };
  locked: { bg: string; border: string; text: string };
  correct: { bg: string; border: string; text: string };
  wrong: { bg: string; border: string; text: string };
  selected: { bg: string; border: string; text: string };
  btnPrimary: { bg: string; border: string; text: string; hover: string; hoverBorder: string };
  btnSecondary: { bg: string; border: string; text: string; hover: string; hoverBorder: string };
  btnDanger: { bg: string; border: string; text: string; hover: string; hoverBorder: string };
  btnReveal: { bg: string; border: string; text: string; hover: string; hoverBorder: string };
  scoreText: string;
  scoreAccent: string;
  scoreMuted: string;
  timer: string;
  timerDone: string;
  successBg: string;
  successText: string;
  selectorBg: string;
  selectorActive: string;
  selectorActiveText: string;
  selectorInactive: string;
  selectorDisabled: string;
  scrollbarThumb: string;
  scrollbarTrack: string;
}

const THEMES: Record<ThemeName, ThemeColors> = {
  light: {
    page: "bg-stone-100",
    title: "text-stone-800",
    subtitle: "text-stone-400",
    board: "bg-stone-300",
    slotEmpty: "bg-stone-200",
    slotEmptyBorder: "border-stone-400/50",
    slotDragOver: "bg-blue-50",
    slotDragOverBorder: "border-blue-400",
    poolBg: "bg-stone-200",
    poolLabel: "text-stone-400",
    keycap: {
      bg: "bg-stone-50",
      border: "border-stone-400",
      text: "text-stone-800",
      shadow: "shadow",
    },
    locked: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    correct: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    wrong: { bg: "bg-red-50", border: "border-red-300", text: "text-red-900" },
    selected: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800" },
    btnPrimary: {
      bg: "bg-stone-800",
      border: "border-stone-800",
      text: "text-stone-50",
      hover: "hover:bg-stone-600",
      hoverBorder: "hover:border-stone-600",
    },
    btnSecondary: {
      bg: "bg-transparent",
      border: "border-stone-400",
      text: "text-stone-500",
      hover: "hover:text-stone-700",
      hoverBorder: "hover:border-stone-500",
    },
    btnDanger: {
      bg: "bg-red-800",
      border: "border-red-800",
      text: "text-white",
      hover: "hover:bg-red-600",
      hoverBorder: "hover:border-red-600",
    },
    btnReveal: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      text: "text-amber-700",
      hover: "hover:bg-amber-100",
      hoverBorder: "hover:border-amber-400",
    },
    scoreText: "text-stone-500",
    scoreAccent: "text-green-800",
    scoreMuted: "text-stone-400",
    timer: "text-stone-400",
    timerDone: "text-green-700",
    successBg: "bg-green-50",
    successText: "text-green-800",
    selectorBg: "bg-stone-300",
    selectorActive: "bg-stone-50",
    selectorActiveText: "text-stone-800",
    selectorInactive: "text-stone-600",
    selectorDisabled: "text-stone-400",
    scrollbarThumb: "#a8a29e",
    scrollbarTrack: "#e7e5e4",
  },
  dark: {
    page: "bg-zinc-900",
    title: "text-zinc-100",
    subtitle: "text-zinc-500",
    board: "bg-zinc-800",
    slotEmpty: "bg-zinc-700",
    slotEmptyBorder: "border-zinc-600",
    slotDragOver: "bg-blue-900/40",
    slotDragOverBorder: "border-blue-400",
    poolBg: "bg-zinc-800",
    poolLabel: "text-zinc-500",
    keycap: {
      bg: "bg-zinc-700",
      border: "border-zinc-500",
      text: "text-zinc-100",
      shadow: "shadow-md shadow-black/30",
    },
    locked: { bg: "bg-green-900/40", border: "border-green-600", text: "text-green-300" },
    correct: { bg: "bg-green-900/40", border: "border-green-600", text: "text-green-300" },
    wrong: { bg: "bg-red-900/40", border: "border-red-500", text: "text-red-300" },
    selected: { bg: "bg-blue-900/40", border: "border-blue-400", text: "text-blue-300" },
    btnPrimary: {
      bg: "bg-zinc-100",
      border: "border-zinc-100",
      text: "text-zinc-900",
      hover: "hover:bg-zinc-300",
      hoverBorder: "hover:border-zinc-300",
    },
    btnSecondary: {
      bg: "bg-transparent",
      border: "border-zinc-600",
      text: "text-zinc-400",
      hover: "hover:text-zinc-200",
      hoverBorder: "hover:border-zinc-500",
    },
    btnDanger: {
      bg: "bg-red-700",
      border: "border-red-700",
      text: "text-white",
      hover: "hover:bg-red-600",
      hoverBorder: "hover:border-red-600",
    },
    btnReveal: {
      bg: "bg-amber-900/30",
      border: "border-amber-600",
      text: "text-amber-400",
      hover: "hover:bg-amber-900/50",
      hoverBorder: "hover:border-amber-500",
    },
    scoreText: "text-zinc-400",
    scoreAccent: "text-green-400",
    scoreMuted: "text-zinc-500",
    timer: "text-zinc-500",
    timerDone: "text-green-400",
    successBg: "bg-green-900/30",
    successText: "text-green-300",
    selectorBg: "bg-zinc-800",
    selectorActive: "bg-zinc-600",
    selectorActiveText: "text-zinc-100",
    selectorInactive: "text-zinc-400",
    selectorDisabled: "text-zinc-600",
    scrollbarThumb: "#52525b",
    scrollbarTrack: "#27272a",
  },
  retro: {
    page: "bg-[#0a0a1a]",
    title: "text-fuchsia-400",
    subtitle: "text-purple-400/70",
    board: "bg-[#1a0a2e]",
    slotEmpty: "bg-[#120820]",
    slotEmptyBorder: "border-purple-800/60",
    slotDragOver: "bg-fuchsia-900/30",
    slotDragOverBorder: "border-fuchsia-400",
    poolBg: "bg-[#1a0a2e]/80",
    poolLabel: "text-purple-400/70",
    keycap: {
      bg: "bg-[#1e1040]",
      border: "border-fuchsia-600",
      text: "text-cyan-300",
      shadow: "shadow-md shadow-fuchsia-500/30",
    },
    locked: { bg: "bg-cyan-900/30", border: "border-cyan-400", text: "text-cyan-300" },
    correct: { bg: "bg-cyan-900/30", border: "border-cyan-400", text: "text-cyan-300" },
    wrong: { bg: "bg-pink-900/40", border: "border-pink-500", text: "text-pink-300" },
    selected: { bg: "bg-fuchsia-900/40", border: "border-fuchsia-400", text: "text-fuchsia-200" },
    btnPrimary: {
      bg: "bg-fuchsia-600",
      border: "border-fuchsia-500",
      text: "text-white",
      hover: "hover:bg-fuchsia-500",
      hoverBorder: "hover:border-fuchsia-400",
    },
    btnSecondary: {
      bg: "bg-transparent",
      border: "border-purple-600",
      text: "text-purple-300",
      hover: "hover:text-fuchsia-300",
      hoverBorder: "hover:border-fuchsia-500",
    },
    btnDanger: {
      bg: "bg-pink-700",
      border: "border-pink-600",
      text: "text-white",
      hover: "hover:bg-pink-600",
      hoverBorder: "hover:border-pink-500",
    },
    btnReveal: {
      bg: "bg-cyan-900/30",
      border: "border-cyan-500",
      text: "text-cyan-300",
      hover: "hover:bg-cyan-900/50",
      hoverBorder: "hover:border-cyan-400",
    },
    scoreText: "text-purple-300",
    scoreAccent: "text-cyan-400",
    scoreMuted: "text-purple-500",
    timer: "text-purple-500",
    timerDone: "text-cyan-400",
    successBg: "bg-cyan-900/20",
    successText: "text-cyan-300",
    selectorBg: "bg-[#1a0a2e]",
    selectorActive: "bg-fuchsia-600",
    selectorActiveText: "text-white",
    selectorInactive: "text-purple-400",
    selectorDisabled: "text-purple-700",
    scrollbarThumb: "#a855f7",
    scrollbarTrack: "#1a0a2e",
  },
};

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "retro", label: "Retro" },
];

type KeycapState = "locked" | "correct" | "wrong" | "selected" | "placed" | "dragover" | "pool";

type Placements = Record<string, string>;

type DragData = { key: null; source: null } | { key: string; source: string };

interface Score {
  correct: number;
  total: number;
}

// --- Constants ---

const KEY_UNIT = 42;
const KEY_GAP = 3;

const slot = (id: string, w: number = 1): SlotDef => ({ id, w });
const spacer = (id: string, w: number): SpacerDef => ({ id, w, spacer: true });

// Physical board — defines positions, widths, spacers. Shared across all layouts.
const BOARD: BoardItem[][] = [
  [
    slot("esc"),
    spacer("_s0", 0.5),
    slot("f1"),
    slot("f2"),
    slot("f3"),
    slot("f4"),
    spacer("_s1", 0.5),
    slot("f5"),
    slot("f6"),
    slot("f7"),
    slot("f8"),
    spacer("_s2", 0.5),
    slot("f9"),
    slot("f10"),
    slot("f11"),
    slot("f12"),
    spacer("_s3", 0.5),
    slot("del"),
  ],
  [
    slot("grave"),
    slot("n1"),
    slot("n2"),
    slot("n3"),
    slot("n4"),
    slot("n5"),
    slot("n6"),
    slot("n7"),
    slot("n8"),
    slot("n9"),
    slot("n0"),
    slot("minus"),
    slot("equal"),
    slot("bksp", 2),
    slot("home"),
  ],
  [
    slot("tab", 1.5),
    slot("q"),
    slot("w"),
    slot("e"),
    slot("r"),
    slot("t"),
    slot("y"),
    slot("u"),
    slot("i"),
    slot("o"),
    slot("p"),
    slot("lbrk"),
    slot("rbrk"),
    slot("bslash", 1.5),
    slot("pgup"),
  ],
  [
    slot("caps", 1.75),
    slot("a"),
    slot("s"),
    slot("d"),
    slot("f"),
    slot("g"),
    slot("h"),
    slot("j"),
    slot("k"),
    slot("l"),
    slot("semi"),
    slot("quote"),
    slot("enter", 2.25),
    slot("pgdn"),
  ],
  [
    slot("lshift", 2.25),
    slot("z"),
    slot("x"),
    slot("c"),
    slot("v"),
    slot("b"),
    slot("n"),
    slot("m"),
    slot("comma"),
    slot("period"),
    slot("slash"),
    slot("rshift", 1.75),
    slot("up"),
    slot("end"),
  ],
  [
    slot("lctrl", 1.25),
    slot("lwin", 1.25),
    slot("lalt", 1.25),
    slot("space", 6.25),
    slot("ralt"),
    slot("fn"),
    slot("rctrl"),
    slot("left"),
    slot("down"),
    slot("right"),
  ],
];

const isSlot = (item: BoardItem): item is SlotDef => !("spacer" in item);
const ALL_SLOT_IDS: string[] = BOARD.flat()
  .filter(isSlot)
  .map((s) => s.id);
const SLOT_WIDTHS: Record<string, number> = Object.fromEntries(
  BOARD.flat()
    .filter(isSlot)
    .map((s) => [s.id, s.w]),
);

// Labels shared by all layouts (modifiers, nav, function keys)
const FIXED_LABELS: Record<string, string> = {
  esc: "Esc",
  f1: "F1",
  f2: "F2",
  f3: "F3",
  f4: "F4",
  f5: "F5",
  f6: "F6",
  f7: "F7",
  f8: "F8",
  f9: "F9",
  f10: "F10",
  f11: "F11",
  f12: "F12",
  del: "Del",
  bksp: "Bksp",
  home: "Home",
  tab: "Tab",
  pgup: "PgUp",
  caps: "Caps",
  pgdn: "PgDn",
  enter: "Enter",
  lshift: "Shift",
  rshift: "Shift",
  up: "↑",
  end: "End",
  lctrl: "Ctrl",
  lwin: "Win",
  lalt: "Alt",
  space: "",
  ralt: "Alt",
  fn: "Fn",
  rctrl: "Ctrl",
  left: "←",
  down: "↓",
  right: "→",
};

// Per-layout labels for variable keys (alpha, numbers-as-symbols, punctuation)
const VARIABLE_LABELS: Record<LayoutName, Record<string, string>> = {
  qwerty: {
    grave: "`",
    n1: "!",
    n2: "@",
    n3: "#",
    n4: "$",
    n5: "%",
    n6: "^",
    n7: "&",
    n8: "*",
    n9: "(",
    n0: ")",
    minus: "−",
    equal: "=",
    q: "Q",
    w: "W",
    e: "E",
    r: "R",
    t: "T",
    y: "Y",
    u: "U",
    i: "I",
    o: "O",
    p: "P",
    lbrk: "[",
    rbrk: "]",
    bslash: "\\",
    a: "A",
    s: "S",
    d: "D",
    f: "F",
    g: "G",
    h: "H",
    j: "J",
    k: "K",
    l: "L",
    semi: ";",
    quote: "'",
    z: "Z",
    x: "X",
    c: "C",
    v: "V",
    b: "B",
    n: "N",
    m: "M",
    comma: ",",
    period: ".",
    slash: "/",
  },
  dvorak: {
    grave: "`",
    n1: "!",
    n2: "@",
    n3: "#",
    n4: "$",
    n5: "%",
    n6: "^",
    n7: "&",
    n8: "*",
    n9: "(",
    n0: ")",
    minus: "[",
    equal: "]",
    q: "'",
    w: ",",
    e: ".",
    r: "P",
    t: "Y",
    y: "F",
    u: "G",
    i: "C",
    o: "R",
    p: "L",
    lbrk: "/",
    rbrk: "=",
    bslash: "\\",
    a: "A",
    s: "O",
    d: "E",
    f: "U",
    g: "I",
    h: "D",
    j: "H",
    k: "T",
    l: "N",
    semi: "S",
    quote: "−",
    z: ";",
    x: "Q",
    c: "J",
    v: "K",
    b: "X",
    n: "B",
    m: "M",
    comma: "W",
    period: "V",
    slash: "Z",
  },
  colemak: {
    grave: "`",
    n1: "!",
    n2: "@",
    n3: "#",
    n4: "$",
    n5: "%",
    n6: "^",
    n7: "&",
    n8: "*",
    n9: "(",
    n0: ")",
    minus: "−",
    equal: "=",
    q: "Q",
    w: "W",
    e: "F",
    r: "P",
    t: "G",
    y: "J",
    u: "L",
    i: "U",
    o: "Y",
    p: ";",
    lbrk: "[",
    rbrk: "]",
    bslash: "\\",
    a: "A",
    s: "R",
    d: "S",
    f: "T",
    g: "D",
    h: "H",
    j: "N",
    k: "E",
    l: "I",
    semi: "O",
    quote: "'",
    z: "Z",
    x: "X",
    c: "C",
    v: "V",
    b: "B",
    n: "K",
    m: "M",
    comma: ",",
    period: ".",
    slash: "/",
  },
};

const MAC_LABELS: Record<string, string> = {
  lctrl: "⌃",
  lwin: "⌥",
  lalt: "⌘",
  ralt: "⌘",
  fn: "⌥",
  rctrl: "⌃",
};

const PLATFORM_OPTIONS: { value: PlatformName; label: string }[] = [
  { value: "windows", label: "PC" },
  { value: "mac", label: "Mac" },
];

const LAYOUT_OPTIONS: { value: LayoutName; label: string }[] = [
  { value: "qwerty", label: "QWERTY" },
  { value: "dvorak", label: "Dvorak" },
  { value: "colemak", label: "Colemak" },
];

const MAC_DISABLED_KEYS = new Set(["del"]);

function buildKeys(layout: LayoutName, platform: PlatformName = "windows"): KeyDef[] {
  const labels = {
    ...FIXED_LABELS,
    ...VARIABLE_LABELS[layout],
    ...(platform === "mac" ? MAC_LABELS : {}),
  };
  return ALL_SLOT_IDS.filter((id) => !(platform === "mac" && MAC_DISABLED_KEYS.has(id))).map(
    (id) => ({
      id,
      label: labels[id] ?? id,
      w: SLOT_WIDTHS[id],
    }),
  );
}

function buildKeyMap(keys: KeyDef[]): Record<string, KeyDef> {
  return Object.fromEntries(keys.map((k) => [k.id, k]));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- API ---

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const SUPABASE_TABLE = import.meta.env.VITE_SUPABASE_TABLE;

async function fetchTotalAttempts(): Promise<number | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=count`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) return null;
    const range = res.headers.get("content-range");
    if (!range) return null;
    const total = range.split("/").pop();
    return total ? parseInt(total, 10) : null;
  } catch {
    return null;
  }
}

async function submitAttempt(payload: {
  attempt: number;
  layout: LayoutName;
  platform: PlatformName;
  hardMode: boolean;
  correct: number;
  total: number;
}): Promise<void> {
  const body = {
    attempt: payload.attempt,
    layout: payload.layout,
    platform: payload.platform,
    hard_mode: payload.hardMode,
    correct: payload.correct,
    total: payload.total,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Failed to submit attempt:", res.status, await res.text());
  }
}

// --- Sound ---

const audioCtx = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  };
})();

const sfx = {
  pickup() {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },
  drop() {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },
  error() {
    const ctx = audioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },
  success() {
    const ctx = audioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  },
  reset() {
    const ctx = audioCtx();
    const notes = [500, 380, 280];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.07;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  },
};

// --- Helpers ---

const keySize = (w: number): { width: number; height: number } => ({
  width: w * KEY_UNIT - KEY_GAP,
  height: KEY_UNIT - KEY_GAP,
});

const keycapCls = (state: KeycapState, t: ThemeColors): string => {
  const base =
    "flex items-center justify-center rounded font-mono select-none transition-all duration-150 shrink-0 box-border border-2 tracking-wide";
  switch (state) {
    case "locked":
    case "correct":
      return `${base} ${t.locked.bg} ${t.locked.border} ${t.locked.text} cursor-default`;
    case "wrong":
      return `${base} ${t.wrong.bg} ${t.wrong.border} ${t.wrong.text} cursor-grab`;
    case "selected":
      return `${base} ${t.selected.bg} ${t.selected.border} ${t.selected.text} scale-105 cursor-grab`;
    case "placed":
      return `${base} ${t.keycap.bg} ${t.keycap.border} ${t.keycap.text} shadow-sm cursor-grab`;
    case "dragover":
      return `${base} ${t.slotDragOver} ${t.slotDragOverBorder} border-dashed cursor-grab`;
    case "pool":
      return `${base} ${t.keycap.bg} ${t.keycap.border} ${t.keycap.text} ${t.keycap.shadow} cursor-grab`;
  }
};

const slotCls = (isDragOver: boolean, hasSelected: boolean, t: ThemeColors): string => {
  const base =
    "flex items-center justify-center rounded font-mono text-[10px] transition-all duration-150 shrink-0 box-border border-2 border-dashed";
  if (isDragOver) return `${base} ${t.slotDragOverBorder} ${t.slotDragOver} cursor-pointer`;
  return `${base} ${t.slotEmptyBorder} ${t.slotEmpty} ${hasSelected ? "cursor-pointer" : "cursor-default"}`;
};

const getState = (
  isLocked: boolean,
  isCorrect: boolean,
  isWrong: boolean,
  isSelected: boolean,
  isDragOver: boolean,
): KeycapState => {
  if (isDragOver && !isLocked) return "dragover";
  if (isLocked) return "locked";
  if (isCorrect) return "correct";
  if (isWrong) return "wrong";
  if (isSelected) return "selected";
  return "placed";
};

// --- Component ---

export default function App() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("keycapped-theme");
    if (saved === "light" || saved === "dark" || saved === "retro") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("keycapped-theme", theme);
  }, [theme]);
  const t = THEMES[theme];
  const [platform, setPlatform] = useState<PlatformName>(() => {
    const saved = localStorage.getItem("keycapped-platform");
    if (saved === "windows" || saved === "mac") return saved;
    return navigator.platform?.toLowerCase().includes("mac") ? "mac" : "windows";
  });

  useEffect(() => {
    localStorage.setItem("keycapped-platform", platform);
  }, [platform]);

  const [totalAttempts, setTotalAttempts] = useState<number | null>(null);
  useEffect(() => {
    fetchTotalAttempts().then(setTotalAttempts);
  }, []);

  const [layout, setLayout] = useState<LayoutName>(() => {
    const saved = localStorage.getItem("keycapped-layout");
    if (saved === "qwerty" || saved === "dvorak" || saved === "colemak") return saved;
    return "qwerty";
  });

  useEffect(() => {
    localStorage.setItem("keycapped-layout", layout);
  }, [layout]);
  const [placements, setPlacements] = useState<Placements>({});
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [poolOrder, setPoolOrder] = useState<string[]>(() => shuffle(ALL_SLOT_IDS));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [fireRoar, setFireRoar] = useState(false);
  const roarTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [hardMode, setHardMode] = useState<boolean>(() => {
    return localStorage.getItem("keycapped-hard") === "true";
  });

  useEffect(() => {
    localStorage.setItem("keycapped-hard", String(hardMode));
  }, [hardMode]);

  const dragRef = useRef<DragData>({ key: null, source: null });
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStarted = useRef(false);

  const allKeys = useMemo(() => buildKeys(layout, platform), [layout, platform]);
  const keyMap = useMemo(() => buildKeyMap(allKeys), [allKeys]);
  const activeIds = useMemo(() => new Set(allKeys.map((k) => k.id)), [allKeys]);

  // Keys with the same label are interchangeable (e.g. lshift/rshift, lctrl/rctrl)
  const isCorrectPlacement = useCallback(
    (slotId: string, placedKeyId: string): boolean => {
      if (slotId === placedKeyId) return true;
      const slotKey = keyMap[slotId];
      const placed = keyMap[placedKeyId];
      return !!slotKey && !!placed && slotKey.label === placed.label;
    },
    [keyMap],
  );

  const startTimer = useCallback(() => {
    if (timerStarted.current) return;
    timerStarted.current = true;
    const t0 = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 200);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    timerStarted.current = false;
    setElapsed(0);
  }, [stopTimer]);

  const placedSet = useMemo(() => new Set(Object.values(placements)), [placements]);
  const poolKeys = useMemo(
    () => poolOrder.filter((id) => !placedSet.has(id) && activeIds.has(id)),
    [poolOrder, placedSet, activeIds],
  );

  const score = useMemo<Score | null>(() => {
    if (!checked) return null;
    let correct = 0;
    for (const k of allKeys) {
      if (locked.has(k.id) || (placements[k.id] && isCorrectPlacement(k.id, placements[k.id])))
        correct++;
    }
    return { correct, total: allKeys.length };
  }, [checked, placements, locked, allKeys, isCorrectPlacement]);

  const placeKey = useCallback(
    (keyId: string, slotId: string, fromSlot: string | null) => {
      if (locked.has(slotId)) return;
      startTimer();
      setPlacements((prev) => {
        const next = { ...prev };
        const existingInTarget = next[slotId];
        if (fromSlot && fromSlot !== "pool") {
          if (existingInTarget && !locked.has(fromSlot)) {
            next[fromSlot] = existingInTarget;
          } else if (existingInTarget) {
            delete next[slotId];
          } else {
            delete next[fromSlot];
          }
        }
        next[slotId] = keyId;
        return next;
      });
      setChecked(false);
    },
    [locked, startTimer],
  );

  const removeFromSlot = useCallback(
    (slotId: string) => {
      if (locked.has(slotId)) return;
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });
      setChecked(false);
    },
    [locked],
  );

  const handleDragStart =
    (keyId: string, source: string) => (e: React.DragEvent<HTMLDivElement>) => {
      if (locked.has(source)) return;
      dragRef.current = { key: keyId, source };
      sfx.pickup();
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", keyId);
      } catch {
        /* noop */
      }
    };

  const handleDropSlot = (slotId: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredSlot(null);
    setConfirmingReset(false);
    const { key, source } = dragRef.current;
    if (!key) return;
    placeKey(key, slotId, source);
    sfx.drop();
    dragRef.current = { key: null, source: null };
    setSelected(null);
  };

  const handleDropPool = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { key, source } = dragRef.current;
    if (!key || source === "pool") return;
    sfx.drop();
    removeFromSlot(source);
    dragRef.current = { key: null, source: null };
  };

  const handleSlotClick = (slotId: string) => {
    const placedKeyId = placements[slotId];
    if (selected && selectedSource) {
      if (locked.has(slotId)) {
        setSelected(null);
        setSelectedSource(null);
        return;
      }
      placeKey(selected, slotId, selectedSource);
      sfx.drop();
      setSelected(null);
      setSelectedSource(null);
    } else if (placedKeyId && !locked.has(slotId)) {
      sfx.pickup();
      setSelected(placedKeyId);
      setSelectedSource(slotId);
    }
  };

  const handlePoolKeyClick = (keyId: string) => {
    if (selected && selectedSource === "pool" && selected === keyId) {
      setSelected(null);
      setSelectedSource(null);
    } else if (selected && selectedSource && selectedSource !== "pool") {
      removeFromSlot(selectedSource);
      sfx.pickup();
      setSelected(keyId);
      setSelectedSource("pool");
    } else {
      sfx.pickup();
      setSelected(keyId);
      setSelectedSource("pool");
    }
  };

  const check = () => {
    const newLocked = new Set(locked);
    let correct = 0;
    for (const k of allKeys) {
      if (locked.has(k.id) || (placements[k.id] && isCorrectPlacement(k.id, placements[k.id]))) {
        if (!hardMode) newLocked.add(k.id);
        correct++;
      }
    }
    const nextTry = tries + 1;
    setLocked(newLocked);
    setChecked(true);
    setTries(nextTry);
    setSelected(null);
    setSelectedSource(null);

    if (correct === allKeys.length) {
      sfx.success();
    } else {
      sfx.error();
    }

    if (hardMode) {
      if (roarTimer.current) clearTimeout(roarTimer.current);
      setFireRoar(false);
      requestAnimationFrame(() => {
        setFireRoar(true);
        roarTimer.current = setTimeout(() => setFireRoar(false), 800);
      });
    }

    submitAttempt({
      attempt: nextTry,
      layout,
      platform,
      hardMode,
      correct,
      total: allKeys.length,
    }).then(() => fetchTotalAttempts().then(setTotalAttempts));
  };

  const reveal = () => {
    const all: Placements = {};
    for (const k of allKeys) {
      if (!locked.has(k.id)) all[k.id] = k.id;
      else all[k.id] = placements[k.id];
    }
    setPlacements(all);
    setChecked(false);
    setSelected(null);
    setSelectedSource(null);
    setTries(0);
  };

  const resetGame = useCallback(
    (silent = false) => {
      if (!silent) sfx.reset();
      setPlacements({});
      setLocked(new Set());
      setChecked(false);
      setPoolOrder(shuffle(ALL_SLOT_IDS));
      setSelected(null);
      setSelectedSource(null);
      setTries(0);
      setConfirmingReset(false);
      resetTimer();
    },
    [resetTimer],
  );

  const handleLayoutChange = (next: LayoutName) => {
    if (next === layout) return;
    setLayout(next);
    resetGame(true);
  };

  const handlePlatformChange = (next: PlatformName) => {
    if (next === platform) return;
    setPlatform(next);
    resetGame(true);
  };

  const allCorrect = score !== null && score.correct === score.total;
  const hasPlaced = Object.keys(placements).length > 0;
  const gameActive = hasPlaced || locked.size > 0;

  useEffect(() => {
    if (allCorrect) stopTimer();
  }, [allCorrect, stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`h-screen ${t.page} flex flex-col font-mono transition-colors duration-300 overflow-hidden select-none`}
    >
      {/* ===== TOP BAR ===== */}
      <header className="relative flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className={`text-xl font-semibold ${t.title} tracking-tight`}>keycapped</h1>
          <a
            href="https://github.com/jiafra/keycapped"
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.subtitle} hover:${t.title} transition-colors duration-150`}
            aria-label="GitHub repository"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>

        {/* Timer - center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <p
            className={`text-2xl tabular-nums ${allCorrect ? `${t.timerDone} font-semibold` : t.timer}`}
          >
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Worldwide attempts - right */}
        <p className={`text-xs ${t.subtitle} tabular-nums font-bold tracking-wide opacity-60`}>
          {totalAttempts !== null ? `${totalAttempts.toLocaleString()} attempts worldwide` : "..."}
        </p>
      </header>

      {/* ===== GAME AREA ===== */}
      <main className="flex-1 overflow-auto relative">
        <div className="min-h-full flex flex-col items-center justify-center gap-4 px-4 py-4">
          {/* Success overlay */}
          {allCorrect && (
            <div
              className={`absolute top-4 px-6 py-3 ${t.successBg} rounded-lg ${t.successText} text-sm font-medium tracking-wide z-10`}
            >
              You know your keyboard. Well done!
            </div>
          )}

          <p className={`text-sm min-h-5 ${!gameActive ? t.subtitle : ""}`}>
            {!gameActive && "All your keys fell off. Can you put them back?"}
          </p>
          <p
            className={`text-xs font-semibold min-h-4 ${score ? (allCorrect ? t.scoreAccent : t.scoreText) : ""}`}
          >
            {score && (
              <>
                {allCorrect ? (
                  `All ${score.total} correct`
                ) : (
                  <>
                    {score.correct} / {score.total} correct
                  </>
                )}{" "}
                <span className={`${t.scoreMuted} font-normal`}>
                  ({tries} {tries === 1 ? "try" : "tries"})
                </span>
              </>
            )}
          </p>

          {/* Keyboard */}
          <div
            className="w-full overflow-x-auto flex shrink-0"
            style={{ scrollbarColor: `${t.scrollbarThumb} ${t.scrollbarTrack}` }}
          >
            <div
              className={`${t.board} rounded-xl p-2 inline-flex flex-col shadow-md transition-all duration-300 mx-auto shrink-0`}
              style={{
                gap: KEY_GAP,
                ...(hardMode
                  ? {
                      boxShadow: fireRoar
                        ? allCorrect
                          ? "0 0 30px 8px rgba(34,197,94,0.7), 0 0 60px 15px rgba(74,222,128,0.5), 0 0 120px 25px rgba(34,197,94,0.3), inset 0 0 40px 8px rgba(74,222,128,0.3)"
                          : "0 0 30px 8px rgba(239,68,68,0.7), 0 0 60px 15px rgba(249,115,22,0.5), 0 0 120px 25px rgba(239,68,68,0.3), inset 0 0 40px 8px rgba(249,115,22,0.3)"
                        : allCorrect
                          ? "0 0 15px 2px rgba(34,197,94,0.4), 0 0 40px 5px rgba(74,222,128,0.25), 0 0 80px 10px rgba(34,197,94,0.15), inset 0 0 20px 2px rgba(34,197,94,0.1)"
                          : "0 0 15px 2px rgba(239,68,68,0.4), 0 0 40px 5px rgba(249,115,22,0.25), 0 0 80px 10px rgba(239,68,68,0.15), inset 0 0 20px 2px rgba(239,68,68,0.1)",
                      borderRadius: "12px",
                      outline: fireRoar
                        ? allCorrect
                          ? "2px solid rgba(74,222,128,0.6)"
                          : "2px solid rgba(249,115,22,0.6)"
                        : allCorrect
                          ? "1px solid rgba(34,197,94,0.3)"
                          : "1px solid rgba(239,68,68,0.3)",
                      animation: fireRoar
                        ? allCorrect
                          ? "fire-roar-green 0.8s ease-out forwards"
                          : "fire-roar 0.8s ease-out forwards"
                        : allCorrect
                          ? "fire-pulse-green 2s ease-in-out infinite"
                          : "fire-pulse 2s ease-in-out infinite",
                      transition: "box-shadow 0.3s ease, outline 0.3s ease",
                    }
                  : {}),
              }}
            >
              {BOARD.map((row, ri) => (
                <div key={ri} className="flex" style={{ gap: KEY_GAP }}>
                  {row.map((item) => {
                    if ("spacer" in item) {
                      return <div key={item.id} className="shrink-0" style={keySize(item.w)} />;
                    }

                    if (!activeIds.has(item.id)) {
                      return <div key={item.id} className="shrink-0" style={keySize(item.w)} />;
                    }

                    const placedKeyId: string | undefined = placements[item.id];
                    const placedKey: KeyDef | undefined = placedKeyId
                      ? keyMap[placedKeyId]
                      : undefined;
                    const isLocked = locked.has(item.id);
                    const isCorrect =
                      checked &&
                      !isLocked &&
                      !!placedKeyId &&
                      isCorrectPlacement(item.id, placedKeyId);
                    const isWrong =
                      checked && !!placedKeyId && !isCorrectPlacement(item.id, placedKeyId);
                    const isSelected = selected !== null && selectedSource === item.id;
                    const isDragOver = hoveredSlot === item.id;

                    if (!placedKey) {
                      return (
                        <div
                          key={item.id}
                          className={slotCls(isDragOver, selected !== null, t)}
                          style={keySize(item.w)}
                          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                            e.preventDefault();
                            setHoveredSlot(item.id);
                          }}
                          onDragLeave={() => setHoveredSlot(null)}
                          onDrop={handleDropSlot(item.id)}
                          onClick={() => {
                            setConfirmingReset(false);
                            if (selected && selectedSource) {
                              placeKey(selected, item.id, selectedSource);
                              sfx.drop();
                              setSelected(null);
                              setSelectedSource(null);
                            }
                          }}
                        />
                      );
                    }

                    const state = getState(
                      hardMode && !allCorrect ? false : isLocked,
                      hardMode && !allCorrect ? false : isCorrect,
                      hardMode && !allCorrect ? false : isWrong,
                      isSelected,
                      isDragOver,
                    );

                    return (
                      <div
                        key={item.id}
                        draggable={!isLocked}
                        onDragStart={handleDragStart(placedKeyId, item.id)}
                        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                          e.preventDefault();
                          setHoveredSlot(item.id);
                        }}
                        onDragLeave={() => setHoveredSlot(null)}
                        onDrop={handleDropSlot(item.id)}
                        onClick={() => handleSlotClick(item.id)}
                        onDoubleClick={() => !isLocked && removeFromSlot(item.id)}
                        className={keycapCls(state, t)}
                        style={{ ...keySize(item.w), fontSize: item.w > 1.5 ? 11 : 12 }}
                      >
                        {placedKey.label}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex items-center justify-center gap-3 my-2">
            {confirmingReset && (
              <>
                <div
                  className="fixed inset-0 z-10 bg-black/30"
                  onClick={() => setConfirmingReset(false)}
                />
                <div
                  className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg ${t.board} border ${t.btnSecondary.border}`}
                >
                  <span className={`text-sm ${t.scoreText} font-medium whitespace-nowrap`}>
                    Are you sure?
                  </span>
                  <button
                    onClick={() => resetGame()}
                    className={`font-mono text-xs font-semibold px-3 py-1 rounded-md border-2 ${t.btnDanger.border} ${t.btnDanger.bg} ${t.btnDanger.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnDanger.hover} ${t.btnDanger.hoverBorder}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmingReset(false)}
                    className={`font-mono text-xs font-medium px-3 py-1 rounded-md border-2 ${t.btnSecondary.border} ${t.btnSecondary.bg} ${t.btnSecondary.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnSecondary.hoverBorder} ${t.btnSecondary.hover}`}
                  >
                    No
                  </button>
                </div>
              </>
            )}
            <button
              onClick={check}
              disabled={!hasPlaced || allCorrect}
              className={`font-mono text-sm font-semibold px-6 py-2 rounded-md border-2 ${t.btnPrimary.border} ${t.btnPrimary.bg} ${t.btnPrimary.text} tracking-wide transition-all duration-150 ${
                hasPlaced && !allCorrect
                  ? `cursor-pointer ${t.btnPrimary.hover} ${t.btnPrimary.hoverBorder}`
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              Check
            </button>
            <button
              onClick={() => setConfirmingReset(true)}
              disabled={!gameActive}
              className={`font-mono text-sm font-medium px-5 py-2 rounded-md border-2 ${t.btnSecondary.border} ${t.btnSecondary.bg} ${t.btnSecondary.text} transition-all duration-150 tracking-wide ${
                gameActive
                  ? `cursor-pointer ${t.btnSecondary.hoverBorder} ${t.btnSecondary.hover}`
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              Reset
            </button>
            {tries >= 10 && !allCorrect && !hardMode && (
              <button
                onClick={reveal}
                className={`font-mono text-sm font-medium px-5 py-2 rounded-md border-2 ${t.btnReveal.border} ${t.btnReveal.bg} ${t.btnReveal.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnReveal.hover} ${t.btnReveal.hoverBorder}`}
              >
                Reveal
              </button>
            )}
          </div>

          {/* Pool */}
          <div className="max-w-3xl w-full shrink-0">
            {poolKeys.length > 0 ? (
              <>
                <div
                  className={`text-[10px] ${t.poolLabel} uppercase tracking-widest font-semibold mb-1.5 text-center`}
                >
                  {poolKeys.length} remaining
                </div>
                <div
                  className={`flex flex-wrap justify-center p-2.5 ${t.poolBg} rounded-xl min-h-11.5 transition-colors duration-300`}
                  style={{ gap: KEY_GAP + 1 }}
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
                  onDrop={handleDropPool}
                >
                  {poolKeys.map((id) => {
                    const key = keyMap[id];
                    const isSelected = selected === id && selectedSource === "pool";
                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={handleDragStart(id, "pool")}
                        onClick={() => handlePoolKeyClick(id)}
                        className={keycapCls(isSelected ? "selected" : "pool", t)}
                        style={{ ...keySize(key.w), fontSize: key.w > 1.5 ? 11 : 12 }}
                      >
                        {key.label}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="min-h-11.5" />
            )}
          </div>
        </div>
      </main>

      {/* ===== BOTTOM BAR ===== */}
      <footer className="shrink-0 px-6 py-3 flex items-center justify-center gap-4">
        <div className="flex gap-2 flex-wrap items-center justify-center">
          <div className={`flex gap-1 p-1 ${t.selectorBg} rounded-lg w-fit`}>
            {LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleLayoutChange(opt.value)}
                disabled={gameActive && opt.value !== layout}
                className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all duration-150 tracking-wide ${
                  layout === opt.value
                    ? `${t.selectorActive} ${t.selectorActiveText} font-semibold shadow-sm`
                    : gameActive
                      ? `${t.selectorDisabled} cursor-not-allowed`
                      : `${t.selectorInactive} hover:opacity-80 cursor-pointer`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={`flex gap-1 p-1 ${t.selectorBg} rounded-lg w-fit`}>
            {PLATFORM_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePlatformChange(opt.value)}
                disabled={gameActive && opt.value !== platform}
                className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all duration-150 tracking-wide ${
                  platform === opt.value
                    ? `${t.selectorActive} ${t.selectorActiveText} font-semibold shadow-sm`
                    : gameActive
                      ? `${t.selectorDisabled} cursor-not-allowed`
                      : `${t.selectorInactive} hover:opacity-80 cursor-pointer`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={`flex gap-1 p-1 ${t.selectorBg} rounded-lg w-fit`}>
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`font-mono text-xs px-3 py-1.5 rounded-md transition-all duration-150 tracking-wide ${
                  theme === opt.value
                    ? `${t.selectorActive} ${t.selectorActiveText} font-semibold shadow-sm`
                    : `${t.selectorInactive} hover:opacity-80 cursor-pointer`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setHardMode((v) => !v);
              setLocked(new Set());
              setChecked(false);
            }}
            disabled={allCorrect}
            title="No hints - keys won't lock or highlight after checking"
            className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg transition-all duration-150 tracking-wide cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              hardMode
                ? `${t.selectorActive} ${t.selectorActiveText} font-semibold shadow-sm`
                : `${t.selectorBg} ${t.selectorInactive} hover:opacity-80`
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
              <rect
                x="0.5"
                y="0.5"
                width="11"
                height="11"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.4"
              />
              {hardMode && (
                <path
                  d="M2.5 6l2.5 2.5 4.5-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            Hard
          </button>
        </div>
      </footer>
    </div>
  );
}
