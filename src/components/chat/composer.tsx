"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX = 2000;

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const tooLong = value.length > MAX;
  const canSend = !disabled && trimmed.length > 0 && !tooLong;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-[680px] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="relative rounded-2xl border border-input bg-card shadow-[0_1px_2px_rgb(23_24_26/0.04)] transition-colors focus-within:border-ink/40">
        <label htmlFor="composer" className="sr-only">
          Message your coach
        </label>
        <Textarea
          id="composer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about training, recovery or nutrition"
          rows={1}
          aria-invalid={tooLong || undefined}
          className="max-h-48 min-h-[52px] resize-none border-0 bg-transparent py-3.5 pr-14 pl-4 text-[15px] shadow-none focus-visible:ring-0 md:text-[15px]"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label="Send message"
          className="absolute right-2.5 bottom-2.5 size-8 rounded-full"
        >
          <ArrowUp className="size-4" strokeWidth={2.25} />
        </Button>
      </div>
      <p className="mt-2 hidden px-1 text-xs text-muted-foreground sm:block">
        {tooLong ? (
          <span className="text-destructive tabular-nums">
            {value.length} / {MAX} characters. Shorten your message to send it.
          </span>
        ) : (
          "Enter to send. Shift + Enter for a new line. Messages of 3+ words earn XP."
        )}
      </p>
    </form>
  );
}
