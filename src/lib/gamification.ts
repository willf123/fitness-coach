/**
 * Pure gamification engine. No React, no storage. Every function takes `now`
 * so the rules are deterministic and easy to test.
 */

export const XP_PER_MESSAGE = 10;
export const FIRST_CHECKIN_BONUS = 15;
export const STREAK_3_BONUS = 25;
export const STREAK_7_BONUS = 50;
export const MIN_WORDS = 3;
export const XP_COOLDOWN_MS = 20_000;
export const DAILY_GOAL = 3;

export type BadgeId =
  | "first-rep"
  | "warm-up"
  | "on-a-roll"
  | "week-strong"
  | "fuel-up"
  | "program-builder"
  | "early-bird"
  | "night-owl";

export type Badge = { id: BadgeId; name: string; description: string };

export const BADGES: Badge[] = [
  { id: "first-rep", name: "First Rep", description: "Send your first message to the coach." },
  { id: "warm-up", name: "Warm-up", description: `Hit your daily goal of ${DAILY_GOAL} check-ins.` },
  { id: "on-a-roll", name: "On a Roll", description: "Check in 3 days in a row." },
  { id: "week-strong", name: "Week Strong", description: "Check in 7 days in a row." },
  { id: "fuel-up", name: "Fuel Up", description: "Ask the coach about nutrition." },
  { id: "program-builder", name: "Program Builder", description: "Ask for a training plan or split." },
  { id: "early-bird", name: "Early Bird", description: "Check in before 7 am." },
  { id: "night-owl", name: "Night Owl", description: "Check in after 10 pm." },
];

const NUTRITION = /\b(protein|calorie|calories|macro|macros|diet|meal|meals|nutrition|carb|carbs|fat loss|eat|eating|bulk|cut|supplement|creatine)\b/i;
const PROGRAM = /\b(split|program|programme|routine|plan|ppl|push[\s-]?pull|upper[\s/-]?lower|full[\s-]?body|workout)\b/i;

export type Progress = {
  version: 1;
  xp: number;
  totalMessages: number;
  lastXpAt: number | null;
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null; // YYYY-MM-DD, local time
  activeDays: string[]; // most recent last, capped at 60
  today: { day: string; count: number };
  goalsHit: number;
  badges: Partial<Record<BadgeId, number>>; // unlock timestamp
};

export const initialProgress: Progress = {
  version: 1,
  xp: 0,
  totalMessages: 0,
  lastXpAt: null,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  activeDays: [],
  today: { day: "", count: 0 },
  goalsHit: 0,
  badges: {},
};

/* ---------- levels ---------- */

const LEVEL_NAMES = ["Rookie", "Regular", "Committed", "Athlete", "Elite", "Legend"];

/** XP needed to go from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return 50 + 25 * (level - 1);
}

export function levelName(level: number): string {
  if (level <= LEVEL_NAMES.length) return LEVEL_NAMES[level - 1];
  return `Legend ${toRoman(level - LEVEL_NAMES.length + 1)}`;
}

export type LevelInfo = { level: number; name: string; into: number; needed: number; pct: number };

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return { level, name: levelName(level), into: remaining, needed, pct: remaining / needed };
}

/* ---------- days & streaks ---------- */

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey(now: Date): string {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

/** The streak as it stands right now (0 if a day was missed). */
export function currentStreak(p: Progress, now: Date): number {
  if (!p.lastActiveDay) return 0;
  const today = dayKey(now);
  return p.lastActiveDay === today || p.lastActiveDay === yesterdayKey(now) ? p.streak : 0;
}

export function checkedInToday(p: Progress, now: Date): boolean {
  return p.lastActiveDay === dayKey(now);
}

export function todayCount(p: Progress, now: Date): number {
  return p.today.day === dayKey(now) ? p.today.count : 0;
}

/* ---------- awarding ---------- */

export type AwardResult = {
  next: Progress;
  gained: number;
  reason: "ok" | "too-short" | "cooldown";
  levelUp: LevelInfo | null;
  newBadges: Badge[];
  goalCompleted: boolean;
};

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function award(prev: Progress, text: string, now: Date): AwardResult {
  const next: Progress = { ...prev, badges: { ...prev.badges }, today: { ...prev.today } };
  next.totalMessages += 1;

  const unlock = (id: BadgeId) => {
    if (!next.badges[id]) next.badges[id] = now.getTime();
  };
  unlock("first-rep");

  const tooShort = wordCount(text) < MIN_WORDS;
  const onCooldown = prev.lastXpAt !== null && now.getTime() - prev.lastXpAt < XP_COOLDOWN_MS;

  let gained = 0;
  let goalCompleted = false;

  if (!tooShort && !onCooldown) {
    const today = dayKey(now);
    gained = XP_PER_MESSAGE;

    if (prev.lastActiveDay !== today) {
      gained += FIRST_CHECKIN_BONUS;
      next.streak = prev.lastActiveDay === yesterdayKey(now) ? prev.streak + 1 : 1;
      next.bestStreak = Math.max(prev.bestStreak, next.streak);
      next.lastActiveDay = today;
      next.activeDays = [...prev.activeDays, today].slice(-60);
      if (next.streak === 3) gained += STREAK_3_BONUS;
      if (next.streak > 0 && next.streak % 7 === 0) gained += STREAK_7_BONUS;
    }

    if (next.today.day !== today) next.today = { day: today, count: 0 };
    next.today.count += 1;
    if (next.today.count === DAILY_GOAL) {
      goalCompleted = true;
      next.goalsHit += 1;
    }

    next.xp += gained;
    next.lastXpAt = now.getTime();

    if (next.goalsHit >= 1) unlock("warm-up");
    if (next.streak >= 3) unlock("on-a-roll");
    if (next.streak >= 7) unlock("week-strong");
    if (NUTRITION.test(text)) unlock("fuel-up");
    if (PROGRAM.test(text)) unlock("program-builder");
    const hour = now.getHours();
    if (hour >= 4 && hour < 7) unlock("early-bird");
    if (hour >= 22 || hour < 4) unlock("night-owl");
  }

  const before = levelInfo(prev.xp);
  const after = levelInfo(next.xp);

  return {
    next,
    gained,
    reason: tooShort ? "too-short" : onCooldown ? "cooldown" : "ok",
    levelUp: after.level > before.level ? after : null,
    newBadges: BADGES.filter((b) => next.badges[b.id] && !prev.badges[b.id]),
    goalCompleted,
  };
}

/** Defensive parse of whatever was in storage. */
export function parseProgress(raw: unknown): Progress {
  if (typeof raw !== "object" || raw === null) return initialProgress;
  const r = raw as Partial<Progress>;
  if (r.version !== 1) return initialProgress;
  return {
    ...initialProgress,
    ...r,
    activeDays: Array.isArray(r.activeDays) ? r.activeDays.filter((d) => typeof d === "string") : [],
    today: { ...initialProgress.today, ...r.today },
    badges: { ...r.badges },
  };
}

/** The last `n` calendar days (oldest first) with whether each was a check-in day. */
export function recentDays(p: Progress, now: Date, n = 7): { key: string; label: string; active: boolean; isToday: boolean }[] {
  const set = new Set(p.activeDays);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      active: set.has(key),
      isToday: i === 0,
    });
  }
  return out;
}

function toRoman(n: number): string {
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}
