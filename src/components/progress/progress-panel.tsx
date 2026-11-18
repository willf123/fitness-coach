import {
  BADGES,
  DAILY_GOAL,
  checkedInToday,
  currentStreak,
  levelInfo,
  recentDays,
  todayCount,
  type Progress,
} from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Barbell } from "./barbell";
import { BadgeGrid } from "./badge-grid";
import { GoalRing } from "./goal-ring";

export function plateCounts(xp: number) {
  const info = levelInfo(xp);
  const slots = Math.min(8, Math.ceil(info.needed / 10));
  return { info, slots, filled: Math.floor((info.into / info.needed) * slots) };
}

export function ProgressPanel({ progress }: { progress: Progress }) {
  const now = new Date();
  const { info, slots, filled } = plateCounts(progress.xp);
  const streak = currentStreak(progress, now);
  const today = todayCount(progress, now);
  const days = recentDays(progress, now);
  const unlocked = BADGES.filter((b) => progress.badges[b.id]).length;
  const goalDone = today >= DAILY_GOAL;

  return (
    <div className="divide-y divide-border">
      {/* Level */}
      <section aria-labelledby="level-heading" className="px-6 pt-6 pb-5">
        <p className="text-sm text-muted-foreground">Level {info.level}</p>
        <h2 id="level-heading" className="font-heading text-[2.5rem] leading-none font-semibold tracking-tight">
          {info.name}
        </h2>
        <Barbell key={info.level} filled={filled} slots={slots} className="mt-4" />
        <div className="mt-3 flex items-baseline justify-between text-sm tabular-nums">
          <span>
            <span className="font-medium">{info.into}</span>
            <span className="text-muted-foreground"> / {info.needed} XP</span>
          </span>
          <span className="text-muted-foreground">
            {info.needed - info.into} XP to level {info.level + 1}
          </span>
        </div>
      </section>

      {/* Streak */}
      <section aria-labelledby="streak-heading" className="px-6 py-5">
        <div className="flex items-baseline justify-between">
          <h2 id="streak-heading" className="flex items-baseline gap-2">
            <span className="font-heading text-4xl leading-none font-semibold tabular-nums">{streak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">Best {progress.bestStreak}</span>
        </div>
        <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Last 7 days">
          {days.map((d) => (
            <li key={d.key} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-full rounded-full",
                  d.active ? "bg-lime" : d.isToday ? "border border-dashed border-ink/40" : "bg-border",
                )}
                aria-label={`${d.key}: ${d.active ? "checked in" : "no check-in"}`}
              />
              <span className={cn("text-[11px] text-muted-foreground", d.isToday && "font-medium text-foreground")}>
                {d.label}
              </span>
            </li>
          ))}
        </ol>
        {!checkedInToday(progress, now) && (
          <p className="mt-3 text-xs text-muted-foreground">
            {streak > 0 ? "Check in today to keep your streak going." : "Check in today to start a streak."}
          </p>
        )}
      </section>

      {/* Today */}
      <section aria-labelledby="today-heading" className="flex items-center gap-4 px-6 py-5">
        <div className="relative shrink-0">
          <GoalRing done={today} goal={DAILY_GOAL} />
          <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-semibold tabular-nums">
            {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
          </span>
        </div>
        <div>
          <h2 id="today-heading" className="text-sm font-medium">
            {goalDone ? "Daily goal complete" : "Today's goal"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {goalDone
              ? "Nice work. Come back tomorrow."
              : `${DAILY_GOAL - today} more check-in${DAILY_GOAL - today === 1 ? "" : "s"} to hit it.`}
          </p>
        </div>
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-heading" className="px-6 py-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="badges-heading" className="text-sm font-medium">
            Badges
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {unlocked} of {BADGES.length}
          </span>
        </div>
        <BadgeGrid progress={progress} />
      </section>
    </div>
  );
}
