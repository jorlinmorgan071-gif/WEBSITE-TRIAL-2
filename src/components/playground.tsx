"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate as motionAnimate, motion } from "motion/react";
import { animate as animeAnimate, stagger, type JSAnimation } from "animejs";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

type Engine = "gsap" | "motion" | "anime" | "css";

const ENGINES: { id: Engine; label: string; code: string }[] = [
  {
    id: "gsap",
    label: "GSAP",
    code: 'gsap.to(tiles, { y: 0, opacity: 1, stagger: 0.045, ease: "expo.out" })',
  },
  {
    id: "motion",
    label: "Motion",
    code:
      "animate(el, { y: 0, opacity: 1 }, { delay: i * 0.045, ease: [0.16, 1, 0.3, 1] })",
  },
  {
    id: "anime",
    label: "Anime.js",
    code:
      'animate(tiles, { translateY: [26, 0], delay: stagger(45), ease: "outExpo" })',
  },
  {
    id: "css",
    label: "CSS",
    code: "transition: 0.9s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: calc(var(--i) * 45ms)",
  },
];

const TILE_COUNT = 12;
const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * The playground — the exact same stagger-rise effect implemented by four
 * engines. Switch tabs to feel the (identical) result; toggle motion to
 * see the static fallback.
 */
export function Playground() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;
  const [engine, setEngine] = useState<Engine>("gsap");

  const motionControls = useRef<ReturnType<typeof motionAnimate>[]>([]);
  const animeAnim = useRef<JSAnimation | null>(null);

  const getTiles = () =>
    Array.from(
      stageRef.current?.querySelectorAll<HTMLElement>(".pg-tile") ?? [],
    );

  const resetTiles = useCallback(() => {
    motionControls.current.forEach((c) => c.stop());
    motionControls.current = [];
    animeAnim.current?.pause();
    animeAnim.current = null;
    const tiles = getTiles();
    gsap.killTweensOf(tiles);
    tiles.forEach((t) => {
      t.style.removeProperty("transform");
      t.style.removeProperty("opacity");
      t.style.removeProperty("filter");
      t.style.removeProperty("transition");
    });
    stageRef.current?.classList.remove("pg-played");
    return tiles;
  }, []);

  const play = useCallback(
    (which: Engine) => {
      const stage = stageRef.current;
      if (!stage) return;

      /* Static path — motion toggled off or reduced motion requested. */
      if (!active) {
        resetTiles();
        stage.classList.add("pg-played");
        return;
      }

      const tiles = resetTiles();

      if (which === "gsap") {
        gsap.set(tiles, { y: 26, opacity: 0, filter: "blur(10px)" });
        gsap.to(tiles, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.045,
          overwrite: true,
        });
      } else if (which === "motion") {
        motionControls.current = tiles.map((el, i) =>
          motionAnimate(
            el,
            {
              y: [26, 0],
              opacity: [0, 1],
              filter: ["blur(10px)", "blur(0px)"],
            },
            { duration: 0.9, delay: i * 0.045, ease: EXPO },
          ),
        );
      } else if (which === "anime") {
        animeAnim.current = animeAnimate(tiles, {
          translateY: [26, 0],
          opacity: [0, 1],
          filter: ["blur(10px)", "blur(0px)"],
          duration: 900,
          delay: stagger(45),
          ease: "outExpo",
        });
      } else {
        /* CSS — class swap after a reflow so the transition replays. */
        requestAnimationFrame(() => {
          requestAnimationFrame(() => stage.classList.add("pg-played"));
        });
      }
    },
    [active, resetTiles],
  );

  /* First view: run once with the initially selected engine. */
  const firstEngine = useRef(engine);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let seen = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (seen || !entries[0].isIntersecting) return;
        seen = true;
        play(firstEngine.current);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [play]);

  /* Engine switch: replay with the new engine. */
  const switchEngine = (next: Engine) => {
    if (next === engine) return;
    setEngine(next);
    play(next);
  };

  useEffect(
    () => () => {
      motionControls.current.forEach((c) => c.stop());
      animeAnim.current?.pause();
    },
    [],
  );

  return (
    <section ref={rootRef} id="playground" aria-label="Motion playground">
      <div className="container-x py-24 md:py-36">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">08 · Playground</p>
            <h2 className="display-2 mt-4 text-balance text-cream">
              One effect. Four engines.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-fog">
              The same stagger-rise — 26 pixels up, 10 pixels of blur, 45 ms
              apart, expo-out — written four ways. Switch engines and replay.
              They should feel identical. That is the point.
            </p>
          </div>
          <SectionTag
            lib="All engines"
            sub="GSAP · Motion · Anime.js · CSS"
            enabled={motionOn}
            onToggle={setMotionOn}
          />
        </div>

        {/* Engine tabs + replay */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div
            className="flex items-center gap-1 rounded-full border border-hairline bg-surface-1/70 p-1"
            role="tablist"
            aria-label="Animation engine"
          >
            {ENGINES.map((e) => {
              const isSel = engine === e.id;
              return (
                <button
                  key={e.id}
                  role="tab"
                  aria-selected={isSel}
                  type="button"
                  onClick={() => switchEngine(e.id)}
                  className={`relative cursor-pointer rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                    isSel ? "text-cream" : "text-fog hover:text-cream/80"
                  }`}
                >
                  {isSel && active ? (
                    <motion.span
                      layoutId="pg-engine-pill"
                      className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : isSel ? (
                    <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]" />
                  ) : null}
                  <span className="relative z-10">{e.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => play(engine)}
            className="btn-pill btn-ghost font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            <span aria-hidden="true" className="text-signal">
              ↻
            </span>
            Replay
          </button>
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          className="pg-stage pg-css-engine card-panel relative mt-6 overflow-hidden p-6 md:p-10"
        >
          <div
            className="flex flex-wrap items-end justify-center gap-2.5 md:gap-3"
            aria-hidden="true"
          >
            {Array.from({ length: TILE_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`pg-tile flex h-16 w-11 items-center justify-center rounded-xl border font-mono text-[13px] tracking-[0.06em] md:h-24 md:w-16 ${
                  i === 7
                    ? "border-signal/50 bg-signal/10 text-signal shadow-[0_0_24px_rgba(255,90,31,0.25)]"
                    : "border-hairline bg-surface-2 text-fog"
                }`}
                style={{ "--i": i } as React.CSSProperties}
              >
                {String(i).padStart(2, "0")}
              </span>
            ))}
          </div>

          <p className="sr-only">
            Twelve numbered tiles rise into place with a staggered animation,
            driven by {ENGINES.find((e) => e.id === engine)?.label}.
          </p>

          {/* Engine readout */}
          <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-5 md:flex-row md:items-center md:justify-between">
            <code className="block overflow-x-auto font-mono text-[11px] leading-relaxed tracking-[0.02em] text-fog [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-signal">›</span>{" "}
              {ENGINES.find((e) => e.id === engine)?.code}
            </code>
            <p className="tnum shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-fog/70">
              900ms each · 45ms stagger · 1395ms total
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
