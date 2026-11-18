"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readJSON, writeJSON } from "@/lib/storage";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** XP earned by this user message (shown inline). */
  xp?: number;
  /** Short explanation when a message earned no XP. */
  xpNote?: string;
  /** Set on a user message whose reply failed. */
  error?: string;
};

type Stored = { sessionId: string; messages: ChatMessage[] };

const KEY = "coach.chat.v1";
const MAX_STORED = 100;

type ChatReply = { success: true; data: { reply: string } } | { success: false; error: string };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type ReplyReward = { xp: number; note?: string };

/**
 * @param onReply called after the coach replies successfully. Returns the XP
 *                earned by the user's message so it can be shown inline.
 */
export function useChat(onReply: (userText: string) => ReplyReward) {
  // Client-only (rendered with ssr: false), so storage can be read on first render.
  const [initial] = useState(loadStored);
  const [sessionId, setSessionId] = useState(initial.sessionId);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [pending, setPending] = useState(false);
  const onReplyRef = useRef(onReply);

  useEffect(() => {
    onReplyRef.current = onReply;
  }, [onReply]);

  useEffect(() => {
    writeJSON(KEY, { sessionId, messages: messages.slice(-MAX_STORED) } satisfies Stored);
  }, [sessionId, messages]);

  const request = useCallback(
    async (userMsg: ChatMessage) => {
      setPending(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: userMsg.content, sessionId }),
        });
        const body = (await res.json().catch(() => null)) as ChatReply | null;

        if (!body || !body.success) {
          const error = body && !body.success ? body.error : "Something went wrong. Please try again.";
          setMessages((m) => m.map((x) => (x.id === userMsg.id ? { ...x, error } : x)));
          return;
        }

        const { xp, note } = onReplyRef.current(userMsg.content);
        setMessages((m) => [
          ...m.map((x) => (x.id === userMsg.id ? { ...x, error: undefined, xp, xpNote: note } : x)),
          { id: newId(), role: "assistant", content: body.data.reply },
        ]);
      } catch {
        setMessages((m) =>
          m.map((x) => (x.id === userMsg.id ? { ...x, error: "You appear to be offline. Check your connection and retry." } : x)),
        );
      } finally {
        setPending(false);
      }
    },
    [sessionId],
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || pending) return;
      const msg: ChatMessage = { id: newId(), role: "user", content };
      setMessages((m) => [...m, msg]);
      void request(msg);
    },
    [pending, request],
  );

  const retry = useCallback(
    (id: string) => {
      const msg = messages.find((m) => m.id === id);
      if (!msg || pending) return;
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, error: undefined } : x)));
      void request(msg);
    },
    [messages, pending, request],
  );

  const newChat = useCallback(() => {
    if (pending) return;
    setMessages([]);
    setSessionId(newId());
  }, [pending]);

  return { messages, pending, send, retry, newChat };
}

function loadStored(): Stored {
  const stored = readJSON(KEY) as Partial<Stored> | null;
  if (stored && typeof stored.sessionId === "string" && stored.sessionId && Array.isArray(stored.messages)) {
    return { sessionId: stored.sessionId, messages: stored.messages };
  }
  return { sessionId: newId(), messages: [] };
}
