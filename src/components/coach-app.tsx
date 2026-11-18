"use client";

import { useCallback } from "react";
import { SquarePen } from "lucide-react";
import { toast } from "sonner";
import { useChat, type ReplyReward } from "@/hooks/use-chat";
import { useProgress } from "@/hooks/use-progress";
import { DAILY_GOAL, MIN_WORDS } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/message-list";
import { MobileProgressBar } from "@/components/progress/mobile-progress-bar";
import { ProgressPanel } from "@/components/progress/progress-panel";

export function CoachApp() {
  const { progress, awardForMessage } = useProgress();

  const onReply = useCallback(
    (text: string): ReplyReward => {
      const r = awardForMessage(text);

      if (r.levelUp) {
        toast(`Level ${r.levelUp.level} reached`, { description: `You're now ${r.levelUp.name}. Keep showing up.` });
      }
      for (const b of r.newBadges) {
        toast(`Badge unlocked: ${b.name}`, { description: b.description });
      }
      if (r.goalCompleted) {
        toast("Daily goal complete", { description: `${DAILY_GOAL} check-ins today. See you tomorrow.` });
      }

      const note =
        r.reason === "too-short"
          ? `Messages need ${MIN_WORDS}+ words to earn XP`
          : r.reason === "cooldown"
            ? "XP is paused for a few seconds between messages"
            : undefined;
      return { xp: r.gained, note };
    },
    [awardForMessage],
  );

  const chat = useChat(onReply);
  const empty = chat.messages.length === 0;

  return (
    <div className="flex h-dvh">
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <span className="font-heading text-2xl font-bold tracking-tight">Coach</span>
          <Button variant="ghost" size="sm" onClick={chat.newChat} disabled={chat.pending || empty}>
            <SquarePen aria-hidden />
            New chat
          </Button>
        </header>

        <div className="lg:hidden">
          <MobileProgressBar progress={progress} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {empty ? (
            <EmptyState onPick={chat.send} />
          ) : (
            <MessageList messages={chat.messages} pending={chat.pending} onRetry={chat.retry} />
          )}
        </div>

        <div className="shrink-0">
          <Composer onSend={chat.send} disabled={chat.pending} />
        </div>
      </main>

      <aside
        aria-label="Your progress"
        className="hidden w-[340px] shrink-0 overflow-y-auto border-l bg-card lg:block"
      >
        <ProgressPanel progress={progress} />
      </aside>
    </div>
  );
}
