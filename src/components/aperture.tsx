"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, stagger, type JSAnimation } from "animejs";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

const BLADE_COUNT = 9;
const BLADE_STEP = 360 / BLADE_COUNT;
const SPIN_TRAVEL = 52; // degrees the blade assembly rotates while opening
const APO_CLOSED = 2.1; // polygon apothem when nearly closed (viewBox units)
const APO_OPEN = 42.4; // polygon apothem when fully open
const DRAG_TRAVEL = 240; // degrees of ring drag for the full range
const F_STOPS = [16, 11, 8, 5.6, 4, 2.8, 2, 1.7] as const;
const MAX_BLUR = 13; // px of photo blur wide open (shallow depth of field)

/** Blade chord shape in local coords — the bottom edge (y=0) is the blade lip. */
const BLADE_PATH =
  "M -72 0 L -72 -104 Q 0 -148 72 -104 L 72 0 Z";

function bladeTransform(i: number, open: number) {
  const spin = open * SPIN_TRAVEL;
  const apothem = APO_CLOSED + (APO_OPEN - APO_CLOSED) * open;
  return `rotate(${i * BLADE_STEP + spin}) translate(0 ${-apothem})`;
}

/**
 * Anime.js — a draggable 9-blade aperture iris. Rotating the ring opens the
 * blades; wide open, depth of field collapses and the photo behind blurs.
 */
export function Aperture() {
  const reduced = usePrefersReducedMotion();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;

  const svgRef = useRef<SVGSVGElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const fRef = useRef<HTMLSpanElement>(null);
  const bokehRef = useRef<HTMLSpanElement>(null);
  const bladeRefs = useRef<(SVGGElement | null)[]>([]);
  const handleRef = useRef<SVGGElement>(null);
  const stopRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const state = useRef({ open: 0 });
  const anim = useRef<JSAnimation | null>(null);
  const drag = useRef({ on: false, prevAngle: 0 });

  /** Imperative iris render — called by anime.js on every tick. */
  const renderIris = useCallback((open: number) => {
    for (let i = 0; i < BLADE_COUNT; i++) {
      bladeRefs.current[i]?.setAttribute(
        "transform",
        bladeTransform(i, open),
      );
    }
    handleRef.current?.setAttribute(
      "transform",
      `rotate(${-120 + open * DRAG_TRAVEL})`,
    );

    const blurPx = Math.pow(open, 1.5) * MAX_BLUR;
    const photo = photoRef.current;
    if (photo) {
      photo.style.filter = `blur(${blurPx.toFixed(2)}px) saturate(1.08)`;
      photo.style.transform = `scale(${(1 + open * 0.05).toFixed(4)})`;
    }

    const idx = Math.round(open * (F_STOPS.length - 1));
    if (fRef.current) fRef.current.textContent = `ƒ/${F_STOPS[idx]}`;
    if (bokehRef.current)
      bokehRef.current.textContent = `+${blurPx.toFixed(1)}PX`;
    const svg = svgRef.current;
    if (svg) {
      svg.setAttribute("aria-valuenow", String(Math.round(open * 100)));
      svg.setAttribute("aria-valuetext", `ƒ/${F_STOPS[idx]}`);
    }

    stopRefs.current.forEach((seg, i) => {
      seg?.classList.toggle("iris-stop-on", i <= idx && open > 0.02);
    });
  }, []);

  /** Drive the iris through Anime.js (instant when motion is toggled off). */
  const setAperture = useCallback(
    (target: number, duration = 220, ease = "outQuart") => {
      const t = Math.min(1, Math.max(0, target));
      if (!active) {
        anim.current?.pause();
        state.current.open = t;
        renderIris(t);
        return;
      }
      anim.current?.pause();
      anim.current = animate(state.current, {
        open: t,
        duration,
        ease,
        onUpdate: () => renderIris(state.current.open),
      });
    },
    [active, renderIris],
  );

  /* Intro: blades stagger in, then the iris eases half-open. */
  useEffect(() => {
    if (!active) {
      state.current.open = 0.42;
      renderIris(0.42);
      return;
    }

    let seen = false;
    const svg = svgRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (seen || !entries[0].isIntersecting) return;
        seen = true;
        animate(svgRef.current!.querySelectorAll("[data-iris-blade]"), {
          opacity: [0, 1],
          duration: 720,
          delay: stagger(55),
          ease: "outQuart",
        });
        setAperture(0.5, 1500, "outExpo");
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    if (svg) io.observe(svg);

    return () => {
      io.disconnect();
      anim.current?.pause();
    };
  }, [active, renderIris, setAperture]);

  /* Circular pointer drag on the ring. */
  const angleFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    /* setPointerCapture throws on untracked pointer ids (e.g. synthetic
       events) — degrade gracefully to plain move tracking. */
    try {
      svgRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture unavailable */
    }
    drag.current = { on: true, prevAngle: angleFromEvent(e) };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current.on) return;
    const angle = angleFromEvent(e);
    let delta = angle - drag.current.prevAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.current.prevAngle = angle;
    setAperture(state.current.open + delta / DRAG_TRAVEL);
  };

  const endDrag = () => {
    drag.current.on = false;
  };

  /* Keyboard control on the handle. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.15 : 0.05;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      setAperture(state.current.open + step);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      setAperture(state.current.open - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      setAperture(0, 400);
    } else if (e.key === "End") {
      e.preventDefault();
      setAperture(1, 400);
    }
  };

  return (
    <section id="iris" aria-label="Aperture iris demo" className="relative">
      <div className="container-x py-24 md:py-36">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">06 · Iris</p>
            <h2 className="display-2 mt-4 text-balance text-cream">
              The iris is the instrument.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-fog">
              Drag the ring. Nine blades cut the light itself — stopped down
              the city sharpens; wide open, depth of field collapses and it
              dissolves into bokeh.
            </p>
          </div>
          <SectionTag
            lib="Anime.js"
            sub="animate · stagger"
            enabled={motionOn}
            onToggle={setMotionOn}
          />
        </div>

        {/* Iris stage */}
        <div className="card-panel relative mt-12 h-[min(80vh,660px)] min-h-[460px] overflow-hidden">
          {/* Photo — blurs as the iris opens */}
          <div
            ref={photoRef}
            className="absolute inset-0 will-change-[filter,transform]"
            style={{ filter: "blur(0px)" }}
          >
            <Image
              src="/images/aperture-scene.png"
              alt="Moody night street with warm bokeh lights behind the aperture demo"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover brightness-[0.85]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-transparent to-ink/70" />

          {/* The iris */}
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            className="absolute left-1/2 top-1/2 aspect-square w-[min(64vw,430px)] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none active:cursor-grabbing"
            role="slider"
            tabIndex={0}
            aria-label="Aperture ring — drag or use arrow keys to open and close the iris"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={50}
            aria-valuetext="ƒ/2.8"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
          >
            <defs>
              <radialGradient id="iris-blade-grad" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#101014" />
                <stop offset="70%" stopColor="#0a0a0d" />
                <stop offset="100%" stopColor="#050507" />
              </radialGradient>
              <clipPath id="iris-clip">
                <circle cx="50" cy="50" r="49.4" />
              </clipPath>
            </defs>

            {/* Backdrop + ring + ticks */}
            <circle cx="50" cy="50" r="49.4" fill="rgba(7,7,9,0.42)" />
            <circle
              cx="50"
              cy="50"
              r="49.4"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.3"
            />
            {Array.from({ length: 72 }).map((_, t) => {
              /* Rounded so SSR and client serialize identical attributes. */
              const a = (t * 5 * Math.PI) / 180;
              const major = t % 9 === 0;
              const r1 = major ? 47.2 : 48.3;
              const pt = (r: number) => [
                Math.round((50 + Math.sin(a) * r) * 100) / 100,
                Math.round((50 - Math.cos(a) * r) * 100) / 100,
              ] as const;
              const [x1, y1] = pt(r1);
              const [x2, y2] = pt(49.2);
              return (
                <line
                  key={t}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={`rgba(255,255,255,${major ? 0.28 : 0.12})`}
                  strokeWidth="0.22"
                />
              );
            })}

            {/* Blades — rotate around the circle centre (50,50) */}
            <g clipPath="url(#iris-clip)">
              <g transform="translate(50 50)">
                {Array.from({ length: BLADE_COUNT }).map((_, i) => (
                  <g key={i} data-iris-blade transform={bladeTransform(i, 0)}>
                    <path
                      d={BLADE_PATH}
                      fill="url(#iris-blade-grad)"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="0.2"
                    />
                    <path
                      d="M -72 0 L 72 0"
                      stroke="#ff5a1f"
                      strokeWidth="0.55"
                      strokeLinecap="round"
                      opacity="0.9"
                      style={{ filter: "drop-shadow(0 0 1.5px rgba(255,90,31,0.8))" }}
                    />
                  </g>
                ))}
              </g>
            </g>

            {/* Drag handle riding the ring */}
            <g transform="translate(50 50)">
              <g ref={handleRef} transform="rotate(-120)">
                <g transform="translate(0 -49.4)">
                  <circle
                    r="5.4"
                    fill="none"
                    stroke="rgba(255,90,31,0.35)"
                    strokeWidth="0.3"
                  />
                  <circle
                    r="2.5"
                    fill="#ff5a1f"
                    style={{ filter: "drop-shadow(0 0 3px rgba(255,90,31,0.95))" }}
                  />
                </g>
              </g>
            </g>
          </svg>

          {/* HUD */}
          <div className="pointer-events-none absolute left-5 top-5 md:left-8 md:top-8">
            <p className="mono-chip">Drag the ring · circular</p>
          </div>

          <div className="pointer-events-none absolute right-5 top-5 text-right md:right-8 md:top-8">
            <p className="mono-label">Aperture</p>
            <p className="tnum mt-2 font-mono text-4xl font-medium tracking-[-0.03em] text-cream md:text-5xl">
              <span ref={fRef}>ƒ/16</span>
            </p>
            <div className="mt-3 flex justify-end gap-1">
              {F_STOPS.map((_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    stopRefs.current[i] = el;
                  }}
                  className="iris-stop h-[3px] w-4 rounded-full bg-white/[0.14] transition-colors duration-300 [&.iris-stop-on]:bg-signal [&.iris-stop-on]:shadow-[0_0_8px_rgba(255,90,31,0.8)]"
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-5 left-5 max-w-[240px] md:bottom-8 md:left-8">
            <p className="text-sm leading-snug text-cream/90">
              Wide open, the city dissolves.
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
              Depth of field, rendered live
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-5 right-5 text-right md:bottom-8 md:right-8">
            <p className="mono-label">Bokeh</p>
            <p className="tnum mt-1 font-mono text-sm text-cream/90">
              <span ref={bokehRef}>+0.0</span>PX
            </p>
          </div>
        </div>

        {/* Mobile / accessibility slider */}
        <div className="mt-5 md:hidden">
          <label
            htmlFor="iris-range"
            className="mono-label mb-3 block"
          >
            Aperture — drag to open
          </label>
          <input
            id="iris-range"
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            className="iris-range w-full"
            onChange={(e) => setAperture(Number(e.target.value) / 100, 90)}
            aria-label="Aperture opening"
          />
        </div>
      </div>
    </section>
  );
}
