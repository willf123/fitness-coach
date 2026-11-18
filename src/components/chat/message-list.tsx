"use client";

import { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import type { ChatMessage } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";

type Props = {
  messages: ChatMessage[];
  pending: boolean;
  onRetry: (id: string) => void;
};

export function MessageList({ messages, pending, onRetry }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 pt-8 pb-6 sm:px-6">
      <ol className="space-y-8" aria-live="polite" aria-relevant="additions">
        {messages.map((m) =>
          m.role === "user" ? (
            <li key={m.id} className="flex flex-col items-end gap-1.5">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-bubble px-4 py-2.5 whitespace-pre-wrap">
                {m.content}
              </div>
              {m.error ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <span>{m.error}</span>
                  <Button variant="ghost" size="sm" onClick={() => onRetry(m.id)} disabled={pending}>
                    <RotateCcw aria-hidden />
                    Retry
                  </Button>
                </div>
              ) : m.xp ? (
                <span className="rounded-full bg-lime-soft px-2 py-0.5 text-xs font-medium text-lime-ink tabular-nums">
                  +{m.xp} XP
                </span>
              ) : m.xpNote ? (
                <span className="text-xs text-muted-foreground">{m.xpNote}</span>
              ) : null}
            </li>
          ) : (
            <li key={m.id} className="leading-relaxed">
              <Markdown>{m.content}</Markdown>
            </li>
          ),
        )}
        {pending && (
          <li aria-label="Coach is typing" className="flex h-6 items-center gap-1">
            {["[animation-delay:0ms]", "[animation-delay:150ms]", "[animation-delay:300ms]"].map((delay) => (
              <span key={delay} className={`size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-pulse ${delay}`} />
            ))}
          </li>
        )}
      </ol>
      <div ref={endRef} />
    </div>
  );
}
