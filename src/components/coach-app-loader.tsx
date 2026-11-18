"use client";

import dynamic from "next/dynamic";

/**
 * Progress and chat history live in localStorage, so the app renders on the
 * client only. This avoids hydration mismatches and loading flicker.
 */
export const CoachAppLoader = dynamic(() => import("./coach-app").then((m) => m.CoachApp), {
  ssr: false,
  loading: () => <div className="h-dvh bg-background" aria-busy="true" />,
});
