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
    keycap: { bg: "bg-stone-50", border: "border-stone-400", text: "text-stone-800", shadow: "shadow" },
    locked: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    correct: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    wrong: { bg: "bg-red-50", border: "border-red-300", text: "text-red-900" },
    selected: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800" },
    btnPrimary: { bg: "bg-stone-800", border: "border-stone-800", text: "text-stone-50", hover: "hover:bg-stone-600", hoverBorder: "hover:border-stone-600" },
    btnSecondary: { bg: "bg-transparent", border: "border-stone-400", text: "text-stone-500", hover: "hover:text-stone-700", hoverBorder: "hover:border-stone-500" },
    btnDanger: { bg: "bg-red-800", border: "border-red-800", text: "text-white", hover: "hover:bg-red-600", hoverBorder: "hover:border-red-600" },
    btnReveal: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", hover: "hover:bg-amber-100", hoverBorder: "hover:border-amber-400" },
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
    selectorInactive: "text-stone-500",
    selectorDisabled: "text-stone-300",
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
    keycap: { bg: "bg-zinc-700", border: "border-zinc-500", text: "text-zinc-100", shadow: "shadow-md shadow-black/30" },
    locked: { bg: "bg-green-900/40", border: "border-green-600", text: "text-green-300" },
    correct: { bg: "bg-green-900/40", border: "border-green-600", text: "text-green-300" },
    wrong: { bg: "bg-red-900/40", border: "border-red-500", text: "text-red-300" },
    selected: { bg: "bg-blue-900/40", border: "border-blue-400", text: "text-blue-300" },
    btnPrimary: { bg: "bg-zinc-100", border: "border-zinc-100", text: "text-zinc-900", hover: "hover:bg-zinc-300", hoverBorder: "hover:border-zinc-300" },
    btnSecondary: { bg: "bg-transparent", border: "border-zinc-600", text: "text-zinc-400", hover: "hover:text-zinc-200", hoverBorder: "hover:border-zinc-500" },
    btnDanger: { bg: "bg-red-700", border: "border-red-700", text: "text-white", hover: "hover:bg-red-600", hoverBorder: "hover:border-red-600" },
    btnReveal: { bg: "bg-amber-900/30", border: "border-amber-600", text: "text-amber-400", hover: "hover:bg-amber-900/50", hoverBorder: "hover:border-amber-500" },
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
    keycap: { bg: "bg-[#1e1040]", border: "border-fuchsia-600", text: "text-cyan-300", shadow: "shadow-md shadow-fuchsia-500/30" },
    locked: { bg: "bg-cyan-900/30", border: "border-cyan-400", text: "text-cyan-300" },
    correct: { bg: "bg-cyan-900/30", border: "border-cyan-400", text: "text-cyan-300" },
    wrong: { bg: "bg-pink-900/40", border: "border-pink-500", text: "text-pink-300" },
    selected: { bg: "bg-fuchsia-900/40", border: "border-fuchsia-400", text: "text-fuchsia-200" },
    btnPrimary: { bg: "bg-fuchsia-600", border: "border-fuchsia-500", text: "text-white", hover: "hover:bg-fuchsia-500", hoverBorder: "hover:border-fuchsia-400" },
    btnSecondary: { bg: "bg-transparent", border: "border-purple-600", text: "text-purple-300", hover: "hover:text-fuchsia-300", hoverBorder: "hover:border-fuchsia-500" },
    btnDanger: { bg: "bg-pink-700", border: "border-pink-600", text: "text-white", hover: "hover:bg-pink-600", hoverBorder: "hover:border-pink-500" },
    btnReveal: { bg: "bg-cyan-900/30", border: "border-cyan-500", text: "text-cyan-300", hover: "hover:bg-cyan-900/50", hoverBorder: "hover:border-cyan-400" },
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

const LAYOUT_OPTIONS: { value: LayoutName; label: string }[] = [
  { value: "qwerty", label: "QWERTY" },
  { value: "dvorak", label: "Dvorak" },
  { value: "colemak", label: "Colemak" },
];

function buildKeys(layout: LayoutName): KeyDef[] {
  const labels = { ...FIXED_LABELS, ...VARIABLE_LABELS[layout] };
  return ALL_SLOT_IDS.map((id) => ({
    id,
    label: labels[id] ?? id,
    w: SLOT_WIDTHS[id],
  }));
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

// TODO: Wire to real API
async function submitAttempt(payload: {
  attempt: number;
  layout: LayoutName;
  placements: Placements;
  correct: number;
  total: number;
}): Promise<void> {
  // Mock — replace with actual fetch call
  // e.g. await fetch('/api/attempts', { method: 'POST', body: JSON.stringify(payload) })
  console.log("[mock] submitAttempt", payload);
  return new Promise((resolve) => setTimeout(resolve, 100));
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

const sz = (w: number): { width: number; height: number } => ({
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
  const [theme, setTheme] = useState<ThemeName>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  const t = THEMES[theme];
  const [layout, setLayout] = useState<LayoutName>("qwerty");
  const [placements, setPlacements] = useState<Placements>({});
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, never> | null>(null);
  const [poolOrder, setPoolOrder] = useState<string[]>(() => shuffle(ALL_SLOT_IDS));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const dragRef = useRef<DragData>({ key: null, source: null });
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStarted = useRef(false);

  const allKeys = useMemo(() => buildKeys(layout), [layout]);
  const keyMap = useMemo(() => buildKeyMap(allKeys), [allKeys]);

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
    () => poolOrder.filter((id) => !placedSet.has(id)),
    [poolOrder, placedSet],
  );

  const score = useMemo<Score | null>(() => {
    if (!results) return null;
    let correct = 0;
    for (const k of allKeys) {
      if (locked.has(k.id) || (placements[k.id] && isCorrectPlacement(k.id, placements[k.id]))) correct++;
    }
    return { correct, total: allKeys.length };
  }, [results, placements, locked, allKeys, isCorrectPlacement]);

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
      setResults(null);
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
      setResults(null);
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
        newLocked.add(k.id);
        correct++;
      }
    }
    const nextTry = tries + 1;
    setLocked(newLocked);
    setResults({});
    setTries(nextTry);
    setSelected(null);
    setSelectedSource(null);

    if (correct === allKeys.length) {
      sfx.success();
    } else {
      sfx.error();
    }

    submitAttempt({
      attempt: nextTry,
      layout,
      placements: { ...placements },
      correct,
      total: allKeys.length,
    });
  };

  const reveal = () => {
    const all: Placements = {};
    for (const k of allKeys) {
      if (!locked.has(k.id)) all[k.id] = k.id;
      else all[k.id] = placements[k.id];
    }
    setPlacements(all);
    setResults(null);
    setSelected(null);
    setSelectedSource(null);
    setTries(0);
  };

  const resetGame = useCallback(() => {
    sfx.reset();
    setPlacements({});
    setLocked(new Set());
    setResults(null);
    setPoolOrder(shuffle(ALL_SLOT_IDS));
    setSelected(null);
    setSelectedSource(null);
    setTries(0);
    setConfirmingReset(false);
    resetTimer();
  }, [resetTimer]);

  const handleLayoutChange = (next: LayoutName) => {
    if (next === layout) return;
    setLayout(next);
    resetGame();
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
    <div className={`min-h-screen ${t.page} flex flex-col items-center px-4 py-6 font-mono transition-colors duration-300`}>
      {/* Header */}
      <div className="text-center mb-7">
        <h1 className={`text-xl font-semibold ${t.title} tracking-tight`}>keycapped</h1>
        <p className={`text-xs ${t.subtitle} mt-1.5`}>
          All your keycaps fell off. Can you put them back?
        </p>
        {/* Selectors */}
        <div className="flex gap-3 my-6 justify-center flex-wrap">
          {/* Layout selector */}
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
          {/* Theme selector */}
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
        </div>
        <p
          className={`text-sm tabular-nums ${allCorrect ? `${t.timerDone} font-semibold` : t.timer}`}
        >
          {formatTime(elapsed)}
        </p>
      </div>

      {/* Keyboard */}
      <div
        className={`${t.board} rounded-xl p-2 inline-flex flex-col shadow-md transition-colors duration-300`}
        style={{ gap: KEY_GAP }}
      >
        {BOARD.map((row, ri) => (
          <div key={ri} className="flex" style={{ gap: KEY_GAP }}>
            {row.map((item) => {
              if ("spacer" in item) {
                return <div key={item.id} className="shrink-0" style={sz(item.w)} />;
              }

              const placedKeyId: string | undefined = placements[item.id];
              const placedKey: KeyDef | undefined = placedKeyId ? keyMap[placedKeyId] : undefined;
              const isLocked = locked.has(item.id);
              const isCorrect = !!results && !isLocked && !!placedKeyId && isCorrectPlacement(item.id, placedKeyId);
              const isWrong = !!results && !!placedKeyId && !isCorrectPlacement(item.id, placedKeyId);
              const isSelected = selected !== null && selectedSource === item.id;
              const isDragOver = hoveredSlot === item.id;

              if (!placedKey) {
                return (
                  <div
                    key={item.id}
                    className={slotCls(isDragOver, selected !== null, t)}
                    style={sz(item.w)}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setHoveredSlot(item.id);
                    }}
                    onDragLeave={() => setHoveredSlot(null)}
                    onDrop={handleDropSlot(item.id)}
                    onClick={() => {
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

              const state = getState(isLocked, isCorrect, isWrong, isSelected, isDragOver);

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
                  style={{ ...sz(item.w), fontSize: item.w > 1.5 ? 11 : 12 }}
                >
                  {placedKey.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 my-5 flex-wrap justify-center min-h-[38px]">
        {confirmingReset ? (
          <>
            <span className={`text-sm ${t.scoreText} font-medium`}>Are you sure?</span>
            <button
              onClick={resetGame}
              className={`font-mono text-sm font-semibold px-5 py-2 rounded-md border-2 ${t.btnDanger.border} ${t.btnDanger.bg} ${t.btnDanger.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnDanger.hover} ${t.btnDanger.hoverBorder}`}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmingReset(false)}
              className={`font-mono text-sm font-medium px-5 py-2 rounded-md border-2 ${t.btnSecondary.border} ${t.btnSecondary.bg} ${t.btnSecondary.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnSecondary.hoverBorder} ${t.btnSecondary.hover}`}
            >
              No
            </button>
          </>
        ) : (
          <>
            <button
              onClick={check}
              disabled={!hasPlaced}
              className={`font-mono text-sm font-semibold px-6 py-2 rounded-md border-2 ${t.btnPrimary.border} ${t.btnPrimary.bg} ${t.btnPrimary.text} tracking-wide transition-all duration-150 ${
                hasPlaced
                  ? `cursor-pointer ${t.btnPrimary.hover} ${t.btnPrimary.hoverBorder}`
                  : "cursor-not-allowed opacity-40"
              }`}
            >
              Check
            </button>
            <button
              onClick={() => setConfirmingReset(true)}
              className={`font-mono text-sm font-medium px-5 py-2 rounded-md border-2 ${t.btnSecondary.border} ${t.btnSecondary.bg} ${t.btnSecondary.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnSecondary.hoverBorder} ${t.btnSecondary.hover}`}
            >
              Reset
            </button>
            {tries >= 10 && !allCorrect && (
              <button
                onClick={reveal}
                className={`font-mono text-sm font-medium px-5 py-2 rounded-md border-2 ${t.btnReveal.border} ${t.btnReveal.bg} ${t.btnReveal.text} cursor-pointer transition-all duration-150 tracking-wide ${t.btnReveal.hover} ${t.btnReveal.hoverBorder}`}
              >
                Reveal
              </button>
            )}
            {score && (
              <div
                className={`text-sm font-semibold ${allCorrect ? t.scoreAccent : t.scoreText}`}
              >
                {allCorrect ? (
                  <span>✓ Perfect — all {score.total} keys correct</span>
                ) : (
                  <span>
                    <span className="text-lg font-bold">{score.correct}</span>
                    <span className={`${t.scoreMuted}`}> / {score.total}</span>
                    <span className={`${t.scoreMuted} font-normal ml-1.5`}>correct</span>
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pool */}
      {poolKeys.length > 0 && (
        <div className="max-w-3xl w-full">
          <div className={`text-[10px] ${t.poolLabel} uppercase tracking-widest font-semibold mb-2 text-center`}>
            Keycaps ({poolKeys.length} remaining)
          </div>
          <div
            className={`flex flex-wrap justify-center p-3 ${t.poolBg} rounded-xl min-h-[50px] transition-colors duration-300`}
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
                  style={{ ...sz(key.w), fontSize: key.w > 1.5 ? 11 : 12 }}
                >
                  {key.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allCorrect && (
        <div className={`mt-5 px-6 py-3 ${t.successBg} rounded-lg ${t.successText} text-sm font-medium text-center`}>
          You know your keyboard. Well done in {formatTime(elapsed)}.
        </div>
      )}
    </div>
  );
}
