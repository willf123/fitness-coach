import { cn } from "@/lib/utils";

/** Plate heights from the collar outwards: big plates first, like a real bar. */
const PLATE_HEIGHTS = [60, 60, 52, 52, 44, 44, 36, 36];
const PLATE_W = 9;
const GAP = 2;
const BAR_Y = 40;

type Props = {
  /** Plates loaded on each side. */
  filled: number;
  /** Plate slots on each side for this level. */
  slots: number;
  className?: string;
};

/**
 * Level meter drawn as a barbell. Each XP-earning check-in loads a plate on
 * both sides; a full bar means the next level.
 */
export function Barbell({ filled, slots, className }: Props) {
  const width = 300;
  const center = width / 2;
  const collar = 42; // half the grip width

  const plates = Array.from({ length: slots }, (_, i) => {
    const h = PLATE_HEIGHTS[Math.min(i, PLATE_HEIGHTS.length - 1)];
    const offset = collar + 6 + i * (PLATE_W + GAP);
    return { i, h, offset, loaded: i < filled, newest: i === filled - 1 };
  });

  return (
    <svg
      viewBox={`0 0 ${width} 80`}
      className={cn("w-full", className)}
      role="img"
      aria-label={`${filled} of ${slots} plates loaded`}
    >
      {/* bar */}
      <rect x="4" y={BAR_Y - 2.5} width={width - 8} height="5" rx="2.5" className="fill-ink" />
      {/* collars */}
      {[center - collar - 4, center + collar].map((x) => (
        <rect key={x} x={x} y={BAR_Y - 9} width="4" height="18" rx="1" className="fill-ink" />
      ))}
      {/* plates, mirrored */}
      {plates.map((p) =>
        [center - p.offset - PLATE_W, center + p.offset].map((x, side) => (
          <rect
            key={`${p.i}-${side}`}
            x={x}
            y={BAR_Y - p.h / 2}
            width={PLATE_W}
            height={p.h}
            rx="2"
            className={cn(
              "transition-colors duration-200",
              p.loaded ? "fill-lime stroke-ink" : "fill-transparent stroke-border",
              p.newest && "motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-300",
            )}
            strokeWidth={p.loaded ? 1.5 : 1}
          />
        )),
      )}
    </svg>
  );
}
