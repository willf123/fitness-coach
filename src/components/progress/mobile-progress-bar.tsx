"use client";

import { DAILY_GOAL, currentStreak, todayCount, type Progress } from "@/lib/gamification";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GoalRing } from "./goal-ring";
import { ProgressPanel, plateCounts } from "./progress-panel";

/** Compact progress summary for small screens; tap to open the full panel. */
export function MobileProgressBar({ progress }: { progress: Progress }) {
  const now = new Date();
  const { info } = plateCounts(progress.xp);
  const streak = currentStreak(progress, now);
  const today = todayCount(progress, now);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-4 border-b bg-card px-4 py-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
          aria-label="Show your progress"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-lg leading-none font-semibold">{info.name}</span>
              <span className="text-xs text-muted-foreground">Level {info.level}</span>
            </div>
            <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="mt-1.5 h-1.5 w-full" aria-hidden>
              <rect width="100" height="6" rx="3" className="fill-border" />
              <rect width={Math.max(info.pct * 100, 0)} height="6" rx="3" className="fill-lime" />
            </svg>
          </div>
          <div className="text-right">
            <div className="font-heading text-lg leading-none font-semibold tabular-nums">{streak}</div>
            <div className="text-[11px] text-muted-foreground">day streak</div>
          </div>
          <GoalRing done={today} goal={DAILY_GOAL} size={32} />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Your progress</SheetTitle>
          <SheetDescription>Level, streak, today&apos;s goal and badges.</SheetDescription>
        </SheetHeader>
        <ProgressPanel progress={progress} />
      </SheetContent>
    </Sheet>
  );
}
