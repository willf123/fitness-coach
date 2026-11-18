import "server-only";

/**
 * Minimal in-memory rate limiter for /api/chat.
 *
 * Two layers, both fixed windows:
 *  - per visitor (by IP): PER_IP_LIMIT requests per PER_IP_WINDOW_MS
 *  - global: GLOBAL_DAILY_LIMIT requests per day across all visitors, a
 *    backstop so a distributed spammer can't burn through the OpenRouter budget.
 *
 * State lives in process memory. On serverless hosts (e.g. Vercel) each warm
 * instance keeps its own counters and they reset on cold start, so this is a
 * cheap speed bump, not a hard guarantee. The credit limit on the OpenRouter
 * key is the real ceiling. For strict limits, swap the Map for a shared store
 * such as Upstash Redis.
 */

const PER_IP_LIMIT = 10;
const PER_IP_WINDOW_MS = 60_000;

const GLOBAL_DAILY_LIMIT = 1_000;
const DAY_MS = 24 * 60 * 60_000;

const MAX_TRACKED_IPS = 5_000;

type Bucket = { count: number; resetAt: number };

const perIp = new Map<string, Bucket>();
let global: Bucket = { count: 0, resetAt: Date.now() + DAY_MS };

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number; scope: "visitor" | "global" };

export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  if (now >= global.resetAt) global = { count: 0, resetAt: now + DAY_MS };
  if (global.count >= GLOBAL_DAILY_LIMIT) {
    return {
      ok: false,
      scope: "global",
      retryAfterSeconds: Math.ceil((global.resetAt - now) / 1000),
    };
  }

  let bucket = perIp.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    if (perIp.size >= MAX_TRACKED_IPS) prune(now);
    bucket = { count: 0, resetAt: now + PER_IP_WINDOW_MS };
    perIp.set(ip, bucket);
  }
  if (bucket.count >= PER_IP_LIMIT) {
    return {
      ok: false,
      scope: "visitor",
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  global.count += 1;
  return { ok: true };
}

function prune(now: number) {
  for (const [key, b] of perIp) if (now >= b.resetAt) perIp.delete(key);
  // Still full of live entries: drop the oldest so memory stays bounded.
  while (perIp.size >= MAX_TRACKED_IPS) {
    const oldest = perIp.keys().next().value;
    if (oldest === undefined) break;
    perIp.delete(oldest);
  }
}

/** Best-effort client IP behind a proxy/CDN. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
