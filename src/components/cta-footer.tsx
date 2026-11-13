"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { scrollToId, useLenis } from "@/components/smooth-scroll";
import { usePrefersReducedMotion } from "@/lib/hooks";

/** Pre-order finale — full-bleed imagery, magnetic CTA (Motion). */
export function Cta() {
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 240, damping: 20, mass: 0.6 });

  return (
    <section
      id="preorder"
      aria-label="Pre-order"
      className="relative overflow-hidden border-t border-hairline"
    >
      {/* Full-bleed backdrop */}
      <div className="absolute inset-0">
        <Image
          src="/images/cta-wide.png"
          alt="The OBSCURA ONE silhouetted on a ridge at night"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/55 to-ink/85" />
        <div className="absolute inset-0 [background:radial-gradient(70%_60%_at_30%_45%,rgba(255,90,31,0.09),transparent_70%)]" />
      </div>

      <div className="container-x relative flex min-h-[88svh] flex-col justify-center py-24 md:py-32">
        <p className="eyebrow">09 · First run</p>
        <h2 className="display-1 mt-6 max-w-[13ch] text-balance text-cream">
          Your pocket, upgraded.
        </h2>
        <p className="mt-7 max-w-md text-[15px] leading-relaxed text-fog">
          The first run is 5,000 individually numbered bodies. When they are
          gone, they are gone — the second batch ships in autumn.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {reduced ? (
            <button
              type="button"
              onClick={() => scrollToId(lenis, "preorder")}
              className="btn-pill btn-primary px-8 text-base"
            >
              Pre-order — $1,299
            </button>
          ) : (
            <motion.div
              className="inline-block"
              style={{ x: sx, y: sy }}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - (r.left + r.width / 2)) * 0.34);
                y.set((e.clientY - (r.top + r.height / 2)) * 0.34);
              }}
              onPointerLeave={() => {
                x.set(0);
                y.set(0);
              }}
            >
              <button
                type="button"
                onClick={() => scrollToId(lenis, "preorder")}
                className="btn-pill btn-primary px-8 text-base"
              >
                Pre-order — $1,299
              </button>
            </motion.div>
          )}
          <a
            href="#specs"
            onClick={(e) => {
              e.preventDefault();
              scrollToId(lenis, "specs");
            }}
            className="btn-pill btn-ghost"
          >
            Re-read the specs
          </a>
        </div>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-fog">
          $99 deposit · fully refundable · ships spring 2027
        </p>
      </div>
    </section>
  );
}

/** Footer — credits the motion stack, keeps the sticky-bottom contract. */
export function Footer() {
  const lenis = useLenis();

  const cols: { title: string; links: { label: string; id?: string }[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Optics", id: "optics" },
        { label: "Specifications", id: "specs" },
        { label: "Gallery", id: "field" },
        { label: "Pre-order", id: "preorder" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "About" },
        { label: "Journal" },
        { label: "Careers" },
        { label: "Press kit" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy" },
        { label: "Terms" },
        { label: "Warranty" },
        { label: "Trade-in" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-hairline bg-surface-1/40">
      <div className="container-x grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-[7px] border border-hairline bg-surface-1">
              <span className="block h-[7px] w-[7px] rounded-full bg-signal shadow-[0_0_10px_2px_rgba(255,90,31,0.6)]" />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-cream">
              OBSCURA
            </span>
            <span className="rounded-full border border-signal/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-signal">
              ONE
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-fog">
            A design study in compact-camera industrial design and motion
            craft. Not affiliated with any camera maker.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-fog/70">
            Scroll — Lenis × GSAP ticker
            <br />
            Motion — nav · count-up · spotlight · magnetic
            <br />
            Anime.js — aperture iris
            <br />
            Three.js — R3F lens
          </p>
        </div>

        {cols.map((col) => (
          <nav
            key={col.title}
            aria-label={col.title}
            className="md:col-span-2"
          >
            <p className="mono-label">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.id ? (
                    <button
                      type="button"
                      onClick={() => scrollToId(lenis, link.id!)}
                      className="cursor-pointer text-sm text-fog transition-colors duration-300 hover:text-cream"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <span className="text-sm text-fog/70">{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="md:col-span-3">
          <p className="mono-label">Signal</p>
          <p className="mt-4 text-sm leading-relaxed text-fog">
            One dispatch per month. Lightly typed, heavily considered.
          </p>
          <button type="button" className="btn-pill btn-ghost mt-5 w-full">
            Join the list
          </button>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog/70">
            © 2026 Obscura Design Studio — a concept, rendered with intent
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog/70">
            Built with GSAP · Motion · Anime.js · React Three Fiber
          </p>
        </div>
      </div>
    </footer>
  );
}
