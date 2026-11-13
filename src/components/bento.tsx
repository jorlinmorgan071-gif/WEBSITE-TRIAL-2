"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

/** Motion count-up — expo-out number roll when scrolled into view. */
function CountUp({
  to,
  decimals = 0,
  duration = 1.7,
  instant = false,
  suffix,
  prefix,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  instant?: boolean;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    const write = (v: number) =>
      (el.textContent = `${prefix ?? ""}${v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix ?? ""}`);

    if (instant) {
      write(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: write,
    });
    return () => controls.stop();
  }, [inView, to, decimals, duration, instant, prefix, suffix]);

  return (
    <span ref={ref} className="tnum">
      {prefix ?? ""}0{suffix ?? ""}
    </span>
  );
}

/** Card with a pointer-tracking orange spotlight. */
function SpotlightCard({
  active,
  children,
  className = "",
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(540px circle at ${mx}px ${my}px, rgb(255 90 31 / 0.16), rgb(237 237 234 / 0.05) 40%, transparent 68%)`;

  return (
    <div
      className={`card-panel group relative overflow-hidden ${className}`}
      onPointerMove={
        active
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              mx.set(e.clientX - r.left);
              my.set(e.clientY - r.top);
            }
          : undefined
      }
      onPointerLeave={
        active
          ? () => {
              mx.set(-400);
              my.set(-400);
            }
          : undefined
      }
    >
      {active ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{ background: spotlight }}
        />
      ) : null}
      {children}
    </div>
  );
}

function NumberCard({
  value,
  decimals = 0,
  unit,
  label,
  sub,
  instant,
  className = "",
  big = false,
  prefix,
}: {
  value: number;
  decimals?: number;
  unit: string;
  label: string;
  sub: string;
  instant: boolean;
  className?: string;
  big?: boolean;
  prefix?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={`card-panel relative flex flex-col justify-between overflow-hidden p-6 ${className}`}
    >
      <p className="mono-label">{label}</p>
      <p
        className={`tnum mt-6 font-mono font-medium tracking-[-0.03em] text-cream ${
          big ? "text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.9]" : "text-5xl leading-none md:text-6xl"
        }`}
      >
        {prefix ? (
          <span className="mr-1 align-top text-[0.38em] tracking-[0.08em] text-signal">
            {prefix}
          </span>
        ) : null}
        <CountUp to={value} decimals={decimals} instant={instant} />
        {unit ? (
          <span className="ml-1.5 align-top text-[0.38em] tracking-[0.08em] text-signal">
            {unit}
          </span>
        ) : null}
      </p>
      <p className="mt-5 text-[13px] leading-snug text-fog">{sub}</p>
    </motion.div>
  );
}

/** Specs bento — asymmetric grid, Motion count-ups, pointer spotlight. */
export function Bento() {
  const reduced = usePrefersReducedMotion();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;
  const instant = !active;

  return (
    <section id="specs" aria-label="Specifications" className="relative">
      <div className="container-x py-24 md:py-36">
        <motion.div
          initial={active ? "hidden" : false}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 gap-4 md:grid-cols-12"
        >
          {/* Section header */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 26 },
              show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="flex flex-col justify-between md:col-span-7 md:pr-8"
          >
            <div>
              <p className="eyebrow">03 · Numbers</p>
              <h2 className="display-2 mt-4 text-balance text-cream">
                Obsessive, by every measure.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-fog">
                Every number survived a fight with a machinist. The result is a
                camera that out-resolves bodies three times its size — from a
                jacket pocket.
              </p>
            </div>
            <div className="mt-8">
              <SectionTag
                lib="Motion"
                sub="count-up · spotlight"
                enabled={motionOn}
                onToggle={setMotionOn}
              />
            </div>
          </motion.div>

          {/* 61 MP — hero number */}
          <NumberCard
            value={61}
            unit="MP"
            label="Full-frame BSI CMOS"
            sub="Dual-gain architecture. 14 stops of dynamic range."
            instant={instant}
            big
            className="md:col-span-5 md:row-span-2"
          />

          <NumberCard
            value={1.7}
            decimals={1}
            prefix="ƒ/"
            unit=""
            label="Max aperture"
            sub="Two-thirds of a stop faster than the class norm."
            instant={instant}
            className="md:col-span-3"
          />

          <NumberCard
            value={282}
            unit="G"
            label="Machined body"
            sub="6061-T6 billet. No plastic load paths."
            instant={instant}
            className="md:col-span-4"
          />

          {/* Pointer spotlight texture card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 26 },
              show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="md:col-span-7 md:row-span-2"
          >
            <SpotlightCard active={active} className="h-full min-h-[320px]">
              <div className="absolute inset-0">
                <Image
                  src="/images/texture-dial.png"
                  alt="Macro detail of the machined knurled dial on the OBSCURA ONE"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover brightness-[0.42] transition-[filter] duration-700 group-hover:brightness-[0.6]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/40" />
              </div>
              <div className="relative z-20 flex h-full min-h-[320px] flex-col justify-between p-6">
                <p className="mono-label">Machined, not molded</p>
                <div>
                  <p className="display-3 max-w-[16ch] text-balance text-cream">
                    Every dial cut from solid billet.
                  </p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
                    6061-T6 · 214 min on 5-axis · hard-anodized
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          <NumberCard
            value={51200}
            unit="ISO"
            label="Native range"
            sub="100–51200, expandable to 50. Clean at 12800."
            instant={instant}
            className="md:col-span-5"
          />

          <NumberCard
            value={6}
            unit="STOPS"
            label="In-body stabilization"
            sub="5-axis IBIS, rated at the sensor."
            instant={instant}
            className="md:col-span-3"
          />

          <NumberCard
            value={420}
            unit="SHOTS"
            label="Battery, real-world"
            sub="USB-C PD. 0–80% in 32 minutes."
            instant={instant}
            className="md:col-span-2"
          />
        </motion.div>
      </div>
    </section>
  );
}
