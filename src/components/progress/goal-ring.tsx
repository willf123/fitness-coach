import { cn } from "@/lib/utils";

type Props = { done: number; goal: number; size?: number; className?: string };

/** Segmented ring: one arc per check-in toward today's goal. */
export function GoalRing({ done, goal, size = 64, className }: Props) {
  const stroke = size >= 48 ? 6 : 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = goal > 1 ? 6 : 0;
  const seg = c / goal - gap;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("-rotate-90", className)}
      role="img"
      aria-label={`${Math.min(done, goal)} of ${goal} check-ins today`}
    >
      {Array.from({ length: goal }, (_, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${seg} ${c - seg}`}
          strokeDashoffset={-(i * (c / goal)) - gap / 2}
          className={cn("transition-colors duration-300", i < done ? "stroke-lime" : "stroke-border")}
        />
      ))}
    </svg>
  );
}
