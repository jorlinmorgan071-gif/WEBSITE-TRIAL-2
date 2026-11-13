"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion, useIsMobile } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

type Callout = {
  title: string;
  sub: string;
  anchor: { x: number; y: number };
  elbow: { x: number; y: number };
  end: { x: number; y: number };
  label: { x: number; y: number };
  side: "left" | "right";
};

/** Callout geometry in % of the pinned viewport — tuned to the macro shot. */
const CALLOUTS: Callout[] = [
  {
    title: "35MM ASPH.",
    sub: "One prime. No zoom tax.",
    anchor: { x: 60, y: 36 },
    elbow: { x: 70.5, y: 27 },
    end: { x: 76, y: 27 },
    label: { x: 77.2, y: 27 },
    side: "right",
  },
  {
    title: "ƒ/1.7–ƒ/16",
    sub: "Two-thirds of a stop faster",
    anchor: { x: 41, y: 51 },
    elbow: { x: 30, y: 59 },
    end: { x: 23.5, y: 59 },
    label: { x: 22.3, y: 59 },
    side: "left",
  },
  {
    title: "9-BLADE IRIS",
    sub: "Circular bokeh, stopped down",
    anchor: { x: 55, y: 61 },
    elbow: { x: 66, y: 71 },
    end: { x: 72, y: 71 },
    label: { x: 73.2, y: 71 },
    side: "right",
  },
  {
    title: "FLUORITE COATING",
    sub: "Sub-0.2% flare, measured",
    anchor: { x: 44, y: 31 },
    elbow: { x: 58, y: 17 },
    end: { x: 63, y: 17 },
    label: { x: 64.2, y: 17 },
    side: "right",
  },
];

/**
 * GSAP ScrollTrigger — pinned, scrubbed lens zoom. The macro shot pushes in
 * while orange leader lines draw in, one callout at a time.
 */
export function LensZoom() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !active) return;

    const ctx = gsap.context(() => {
      if (isMobile) {
        /* Mobile: no pin — a light scrubbed parallax on the image. */
        gsap.to("[data-zoom-static-img]", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-zoom-static]",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
        return;
      }

      const readout = root.querySelector<HTMLElement>("[data-zoom-value]");

      /* Hide callouts until their window in the scrub.
         Dash length is unit-agnostic (works with or without pathLength
         normalization under vector-effect: non-scaling-stroke). */
      gsap.set("[data-zoom-line]", { strokeDasharray: 10000, strokeDashoffset: 10000 });
      gsap.set("[data-zoom-dot]", { scale: 0, opacity: 0 });
      gsap.set("[data-zoom-label]", { opacity: 0, y: 12, filter: "blur(6px)" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-zoom-pin]",
          start: "top top",
          end: "+=170%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      tl.to("[data-zoom-img]", {
        scale: 1.78,
        duration: 0.58,
        ease: "power1.inOut",
        transformOrigin: "52% 46%",
        onUpdate: function () {
          if (readout)
            readout.textContent = (1 + this.progress() * 0.78).toFixed(2);
        },
      });

      CALLOUTS.forEach((c, i) => {
        const at = 0.36 + i * 0.13;
        tl.to(`[data-zoom-line="${i}"]`, {
          strokeDashoffset: 0,
          duration: 0.09,
          ease: "power2.out",
        }, at)
          .to(
            `[data-zoom-dot="${i}"]`,
            { scale: 1, opacity: 1, duration: 0.05, ease: "back.out(2.4)" },
            at + 0.015,
          )
          .to(
            `[data-zoom-label="${i}"]`,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.08,
              ease: "expo.out",
            },
            at + 0.06,
          );
      });

      tl.to({}, { duration: 0.06 }); // settle
    }, root);

    return () => ctx.revert();
  }, [active, isMobile]);

  const header = (
    <div className="relative z-10 max-w-xl">
      <p className="eyebrow">02 · Optics</p>
      <h2 className="display-2 mt-4 text-cream">
        One lens.
        <br />
        <span className="text-fog">Zero compromise.</span>
      </h2>
      <div className="mt-6">
        <SectionTag
          lib="GSAP"
          sub="ScrollTrigger"
          enabled={motionOn}
          onToggle={setMotionOn}
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <section ref={rootRef} id="optics" aria-label="Optics" className="relative">
        <div data-zoom-static className="container-x py-20">
          {header}
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fog">
            A single focal length, ground from four aspherical elements. What
            you trade in zoom, you gain back in light — two-thirds of a stop of
            it.
          </p>
          <div className="card-panel relative mt-10 aspect-[4/3] overflow-hidden">
            <div className="absolute -inset-y-12 inset-x-0">
              <Image
                data-zoom-static-img
                src="/images/lens-macro.png"
                alt="Macro view of the OBSCURA ONE lens front element"
                fill
                sizes="100vw"
                className="scale-110 object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CALLOUTS.map((c) => (
              <li key={c.title} className="card-panel flex items-start gap-3 p-4">
                <span className="glow-dot mt-1.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-mono text-xs tracking-[0.14em] text-cream">
                    {c.title}
                  </p>
                  <p className="mt-1 text-[13px] text-fog">{c.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} id="optics" aria-label="Optics" className="relative">
      <div
        data-zoom-pin
        className="relative h-[100svh] overflow-hidden border-y border-hairline"
      >
        {/* Full-bleed macro imagery */}
        <div className="absolute inset-0">
          <Image
            data-zoom-img
            src="/images/lens-macro.png"
            alt="Macro view of the OBSCURA ONE lens front element zooming in"
            fill
            sizes="100vw"
            className="object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-transparent to-ink/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
        </div>

        {/* Header */}
        <div className="container-x absolute inset-x-0 top-0 z-10 pt-24 md:pt-28">
          {header}
        </div>

        {/* Orange leader lines */}
        <svg
          className="absolute inset-0 z-10 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {CALLOUTS.map((c, i) => (
            <path
              key={c.title}
              data-zoom-line={`${i}`}
              d={`M ${c.anchor.x} ${c.anchor.y} L ${c.elbow.x} ${c.elbow.y} L ${c.end.x} ${c.end.y}`}
              fill="none"
              stroke="#ff5a1f"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 4px rgba(255,90,31,0.55))" }}
            />
          ))}
        </svg>

        {/* Anchor dots */}
        {CALLOUTS.map((c, i) => (
          <span
            key={c.title}
            data-zoom-dot={`${i}`}
            className="glow-dot absolute z-10"
            style={{ left: `${c.anchor.x}%`, top: `${c.anchor.y}%` }}
            aria-hidden="true"
          />
        ))}

        {/* Callout labels */}
        {CALLOUTS.map((c, i) => (
          <div
            key={c.title}
            data-zoom-label={`${i}`}
            className="absolute z-10 max-w-[220px]"
            style={{
              left: `${c.label.x}%`,
              top: `${c.label.y}%`,
              transform:
                c.side === "left" ? "translate(-100%, -50%)" : "translateY(-50%)",
            }}
          >
            <p className="font-mono text-xs tracking-[0.14em] text-cream">
              {c.title}
            </p>
            <p
              className={`mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fog ${
                c.side === "left" ? "text-right" : ""
              }`}
            >
              {c.sub}
            </p>
          </div>
        ))}

        {/* Readouts */}
        <div className="container-x absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fog">
            Zoom <span className="tnum text-cream" data-zoom-value>1.00</span>×
          </p>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-fog sm:block">
            35MM EQUIV. · ƒ/1.7–ƒ/16 · 0.28M
          </p>
        </div>
      </div>
    </section>
  );
}
