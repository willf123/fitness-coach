const SUGGESTIONS = [
  "Build me a 3-day full body plan for a beginner",
  "How much protein should I eat to build muscle?",
  "My bench press has stalled for a month. What should I change?",
  "Give me a 20-minute workout with no equipment",
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col justify-end px-4 pt-10 pb-6 sm:justify-center sm:px-6">
      <h1 className="font-heading text-[2.75rem] leading-[0.95] font-semibold tracking-tight text-balance sm:text-6xl">
        What are we training today?
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Ask about workouts, programming, recovery or food. Every check-in loads a plate on your bar.
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="h-full w-full rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-ink/30 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
