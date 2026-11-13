"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

const CONTROLS = [
  {
    id: "aperture-ring",
    index: "01",
    title: "Aperture ring",
    blurb:
      "A click-stopped ring around the lens barrel. ƒ/1.7 to ƒ/16 in third-stop detents, machined from a single billet — because exposure is a physical gesture, not a menu.",
    chips: ["12 DETENTS", "0.4MM THROWS", "DECOUPLED"],
    img: "/images/texture-dial.png",
    alt: "Macro detail of the knurled aperture ring",
  },
  {
    id: "top-plate",
    index: "02",
    title: "Top plate",
    blurb:
      "Milled from one block, engraved by laser, finished by hand. Shutter speed and exposure compensation live here — everything you change between shots, nothing you don't.",
    chips: ["CNC ENGRAVED", "±3 EV", "1/8000 TOP SPEED"],
    img: "/images/gallery-3.png",
    alt: "Top-down view of the OBSCURA ONE machined top plate",
  },
  {
    id: "grip",
    index: "03",
    title: "One-hand grip",
    blurb:
      "The body is 4.2 mm thicker on the right. That's it — that's the trick. It balances a 282-gram camera into any hand and keeps every control under a thumb.",
    chips: ["4.2MM OFFSET", "VEG-TAN LEATHER", "SWAPPABLE"],
    img: "/images/gallery-2.png",
    alt: "The OBSCURA ONE held in one hand at night",
  },
  {
    id: "night",
    index: "04",
    title: "Night control",
    blurb:
      "Backlit markings and a sensor-lit screen wake as the light falls. -6 EV autofocus locks on faces the human eye has already given up on.",
    chips: ["-6 EV AF", "RED NIGHT MODE", "176-NIT MIN"],
    img: "/images/aperture-scene.png",
    alt: "Night city scene with warm bokeh lights",
  },
  {
    id: "weather",
    index: "05",
    title: "All-weather",
    blurb:
      "IP54 sealing at eleven gaskets. It has shot in Icelandic sleet and Bangkok humidity on the same battery — the gallery below is the evidence.",
    chips: ["IP54", "11 GASKETS", "-20°C RATED"],
    img: "/images/gallery-4.png",
    alt: "The OBSCURA ONE on a tripod in fog at blue hour",
  },
] as const;

/** Master-detail — Motion shared-layout indicator + crossfading detail panel. */
export function MasterDetail() {
  const reduced = usePrefersReducedMotion();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;
  const [selected, setSelected] = useState(CONTROLS[0].id);
  const current = CONTROLS.find((c) => c.id === selected) ?? CONTROLS[0];

  return (
    <section id="controls" aria-label="Controls" className="relative">
      <div className="container-x py-24 md:py-36">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">04 · Controls</p>
            <h2 className="display-2 mt-4 text-balance text-cream">
              Every control,
              <br />
              <span className="text-fog">reconsidered.</span>
            </h2>
          </div>
          <SectionTag
            lib="Motion"
            sub="layoutId · AnimatePresence"
            enabled={motionOn}
            onToggle={setMotionOn}
          />
        </div>

        {/* Mobile: chip scroller */}
        <div className="-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CONTROLS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              aria-pressed={selected === c.id}
              className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                selected === c.id
                  ? "border-signal/60 bg-signal/15 text-cream"
                  : "border-hairline bg-surface-1 text-fog"
              }`}
            >
              {c.index} · {c.title}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
          {/* Master list */}
          <ul className="md:col-span-5" role="tablist" aria-label="Controls list">
            {CONTROLS.map((c) => {
              const isSel = selected === c.id;
              return (
                <li key={c.id} role="presentation" className="border-b border-hairline">
                  <button
                    role="tab"
                    aria-selected={isSel}
                    type="button"
                    onClick={() => setSelected(c.id)}
                    className="group relative flex w-full cursor-pointer items-center gap-5 py-5 text-left transition-colors duration-300"
                  >
                    {isSel ? (
                      active ? (
                        <motion.span
                          layoutId="md-indicator"
                          className="absolute -left-4 h-9 w-[3px] rounded-full bg-signal shadow-[0_0_14px_2px_rgba(255,90,31,0.5)]"
                          transition={{ type: "spring", stiffness: 480, damping: 38 }}
                        />
                      ) : (
                        <span className="absolute -left-4 h-9 w-[3px] rounded-full bg-signal" />
                      )
                    ) : null}
                    <span
                      className={`font-mono text-[11px] tracking-[0.18em] transition-colors duration-300 ${
                        isSel ? "text-signal" : "text-fog/60"
                      }`}
                    >
                      {c.index}
                    </span>
                    <span
                      className={`text-lg tracking-[-0.02em] transition-colors duration-300 md:text-xl ${
                        isSel ? "text-cream" : "text-fog group-hover:text-cream/80"
                      }`}
                    >
                      {c.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`ml-auto font-mono text-xs transition-all duration-300 ${
                        isSel ? "translate-x-0 text-signal opacity-100" : "-translate-x-1 opacity-0"
                      }`}
                    >
                      ●
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Detail panel */}
          <div className="md:col-span-7">
            <div className="md:sticky md:top-28">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={current.id}
                  initial={
                    active
                      ? { opacity: 0, y: 22, filter: "blur(8px)" }
                      : undefined
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    active
                      ? { opacity: 0, y: -14, filter: "blur(8px)" }
                      : undefined
                  }
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="card-panel overflow-hidden"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={current.img}
                      alt={current.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="display-3 text-cream">{current.title}</h3>
                    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fog">
                      {current.blurb}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {current.chips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fog"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
