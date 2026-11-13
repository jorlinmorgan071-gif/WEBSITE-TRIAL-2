"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Reactive media query hook (SSR-safe: false on the server, live on the client). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True when the user asks the OS for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Below md breakpoint — pinned scrubbed sections fall back to static layouts. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** Clamp helper shared by interactive sections. */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
