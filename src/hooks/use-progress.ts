"use client";

import { useCallback, useRef, useState } from "react";
import { award, parseProgress, type AwardResult, type Progress } from "@/lib/gamification";
import { readJSON, writeJSON } from "@/lib/storage";

const KEY = "coach.progress.v1";

/** Client-only (rendered with ssr: false), so storage can be read on first render. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => parseProgress(readJSON(KEY)));
  const ref = useRef(progress);

  const awardForMessage = useCallback((text: string): AwardResult => {
    const result = award(ref.current, text, new Date());
    ref.current = result.next;
    setProgress(result.next);
    writeJSON(KEY, result.next);
    return result;
  }, []);

  return { progress, awardForMessage };
}
