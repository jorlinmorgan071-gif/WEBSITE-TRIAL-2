"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { scrollToId, useLenis } from "@/components/smooth-scroll";
import { usePrefersReducedMotion } from "@/lib/hooks";

const LINKS = [
  { id: "optics", label: "Optics" },
  { id: "specs", label: "Specs" },
  { id: "field", label: "Field" },
  { id: "iris", label: "Iris" },
  { id: "lens3d", label: "3D" },
  { id: "playground", label: "Playground" },
] as const;

/** Hide-on-scroll navigation with shared-layout pill tabs and a magnetic CTA. */
export function Nav() {
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (reduced) return;
    setHidden(y > prev && y > 160);
  });

  // Scroll-spy: highlight the pill of the section in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 },
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => scrollToId(lenis, id);

  return (
    <>
      {/* Scroll progress hairline — Lenis feeds Motion's scroll value */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[85] h-[2px] origin-left bg-signal"
        style={{ scaleX: scrollYProgress }}
      />

      <motion.header
        className="fixed inset-x-0 top-0 z-[80]"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "border-b border-hairline bg-ink/70 backdrop-blur-xl"
              : "border-b border-transparent bg-transparent"
          }`}
        >
          <nav
            aria-label="Primary"
            className="container-x flex h-16 items-center justify-between gap-4 md:h-[72px]"
          >
            {/* Wordmark */}
            <button
              type="button"
              onClick={() => go("top")}
              className="group flex cursor-pointer items-center gap-2.5"
              aria-label="OBSCURA ONE — back to top"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-[7px] border border-hairline bg-surface-1">
                <span className="block h-[7px] w-[7px] rounded-full bg-signal shadow-[0_0_10px_2px_rgba(255,90,31,0.6)]" />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-cream">
                OBSCURA
              </span>
              <span className="rounded-full border border-signal/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-signal">
                ONE
              </span>
            </button>

            {/* Shared-layout pill tabs (desktop) */}
            <div
              className="hidden items-center gap-1 rounded-full border border-hairline bg-surface-1/70 p-1 backdrop-blur-xl lg:flex"
              role="tablist"
              aria-label="Sections"
            >
              {LINKS.map((link) => {
                const isActive = active === link.id;
                return (
                  <button
                    key={link.id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => go(link.id)}
                    className={`relative cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${
                      isActive ? "text-cream" : "text-fog hover:text-cream/80"
                    }`}
                  >
                    {isActive && !reduced ? (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : isActive ? (
                      <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]" />
                    ) : null}
                    <span className="relative z-10">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Magnetic pre-order CTA */}
            <MagneticCta reduced={reduced} onClick={() => go("preorder")} />
          </nav>
        </div>
      </motion.header>
    </>
  );
}

function MagneticCta({
  reduced,
  onClick,
}: {
  reduced: boolean;
  onClick: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.6 });

  if (reduced) {
    return (
      <button type="button" onClick={onClick} className="btn-pill btn-primary">
        Pre-order — $1,299
      </button>
    );
  }

  return (
    <motion.div
      className="inline-block"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.38);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <button type="button" onClick={onClick} className="btn-pill btn-primary">
        Pre-order — $1,299
      </button>
    </motion.div>
  );
}
