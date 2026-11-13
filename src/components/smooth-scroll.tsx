"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ------------------------------------------------------------------ */
/* Lenis singleton store — consumed through useSyncExternalStore.      */
/* ------------------------------------------------------------------ */

let lenisInstance: Lenis | null = null;
const listeners = new Set<() => void>();

function emitLenis() {
  listeners.forEach((l) => l());
}

function subscribeLenis(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

const getLenis = () => lenisInstance;
const getNull = () => null;

/** Access the live Lenis instance (null under reduced motion or before mount). */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribeLenis, getLenis, getNull);
}

/**
 * Lenis smooth scroll synced to the GSAP ticker — one rAF loop drives
 * both engines, so ScrollTrigger pins stay perfectly in phase with
 * the smoothed scroll position.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      instance.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenisInstance = instance;
    emitLenis();

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisInstance = null;
      emitLenis();
    };
  }, [reduced]);

  return <>{children}</>;
}

/** Smooth-scroll to an anchor, falling back to native jumping when Lenis is off. */
export function scrollToId(lenis: Lenis | null, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }
}
