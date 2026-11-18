import {
  Apple,
  CalendarCheck,
  ClipboardList,
  Flame,
  MessageCircle,
  Moon,
  Sunrise,
  Target,
  type LucideIcon,
} from "lucide-react";
import { BADGES, type BadgeId, type Progress } from "@/lib/gamification";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeId, LucideIcon> = {
  "first-rep": MessageCircle,
  "warm-up": Target,
  "on-a-roll": Flame,
  "week-strong": CalendarCheck,
  "fuel-up": Apple,
  "program-builder": ClipboardList,
  "early-bird": Sunrise,
  "night-owl": Moon,
};

export function BadgeGrid({ progress }: { progress: Progress }) {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {BADGES.map((b) => {
        const Icon = ICONS[b.id];
        const unlocked = Boolean(progress.badges[b.id]);
        return (
          <li key={b.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${b.name}${unlocked ? "" : " (locked)"}: ${b.description}`}
                  className={cn(
                    "flex aspect-square w-full items-center justify-center rounded-xl border transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                    unlocked
                      ? "border-ink/80 bg-lime-soft text-ink"
                      : "border-dashed border-border text-muted-foreground/50",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex-col items-start gap-0.5">
                <span className="font-medium">{b.name}</span>
                <span className="opacity-75">{unlocked ? b.description : `Locked. ${b.description}`}</span>
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
