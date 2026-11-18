import { NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MESSAGE = 2000;

type ChatReply = { reply: string };

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { message, sessionId } = (json ?? {}) as Record<string, unknown>;
  const text = typeof message === "string" ? message.trim() : "";
  const sid = typeof sessionId === "string" ? sessionId.trim() : "";

  if (!text || text.length > MAX_MESSAGE || !sid || sid.length > 100) {
    return NextResponse.json(
      { success: false, error: `Message must be 1–${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  const { status, body } = await callN8n<ChatReply>({ message: text, sessionId: sid });
  return NextResponse.json(body, { status });
}
