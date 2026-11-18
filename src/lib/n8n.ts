import "server-only";

export type N8nResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type CallResult<T> = { status: number; body: N8nResult<T> };

const TIMEOUT_MS = 60_000;

/**
 * Single entry point for calling the n8n webhook. Server-side only:
 * the API key never reaches the browser.
 */
export async function callN8n<T>(payload: unknown): Promise<CallResult<T>> {
  const url = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!url || !apiKey) {
    console.error("[n8n] N8N_WEBHOOK_URL or N8N_API_KEY is not set");
    return fail(500, "The coach isn't configured yet.");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    console.error("[n8n] request failed", err);
    return timedOut
      ? fail(504, "The coach is taking too long to respond. Please try again.")
      : fail(502, "Couldn't reach the coach. Please try again.");
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    console.error("[n8n] non-JSON response", res.status);
    return fail(502, "The coach sent an unexpected response.");
  }

  if (isResult<T>(body)) return { status: res.status, body };

  console.error("[n8n] unexpected response shape", res.status);
  return fail(res.status === 401 || res.status === 403 ? 500 : 502, "The coach sent an unexpected response.");
}

function fail(status: number, error: string): CallResult<never> {
  return { status, body: { success: false, error } };
}

function isResult<T>(v: unknown): v is N8nResult<T> {
  if (typeof v !== "object" || v === null || !("success" in v)) return false;
  const r = v as Record<string, unknown>;
  return r.success === true ? "data" in r : typeof r.error === "string";
}
