"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, SplitText } from "@/lib/gsap";
import { usePrefersReducedMotion, useIsMobile } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";
import { scrollToId, useLenis } from "@/components/smooth-scroll";

/**
 * GSAP hero — SplitText headline rises out of line masks; on scroll the
 * section pins and plays a deliberate exit: copy blurs away, the headline
 * dissolves letter by letter, and an orange iris ring closes on the lens
 * until the frame is black.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const lenis = useLenis();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    const h1 = h1Ref.current;
    if (!root || !h1 || !active) return;

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = new SplitText(h1, { type: "lines,chars", mask: "lines" });

      /* ---------------- Entrance: lines rise out of their masks ---------------- */
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .fromTo(
          "[data-hero-eyebrow]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.1,
        )
        .fromTo(
          split.lines,
          { yPercent: 108 },
          { yPercent: 0, duration: 1.3, stagger: 0.09 },
          0.18,
        )
        .fromTo(
          "[data-hero-sub]",
          { y: 22, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1 },
          0.62,
        )
        .fromTo(
          "[data-hero-cta]",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
          0.78,
        )
        .fromTo(
          "[data-hero-visual]",
          { opacity: 0, y: 44, scale: 1.08 },
          { opacity: 1, y: 0, scale: 1, duration: 1.6, ease: "power3.out" },
          0.4,
        );

      /* ---------------- Pinned exit: dissolve + iris close ---------------- */
      if (!isMobile) {
        const exit = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        /*
         * If the visitor scrolls during the entrance, complete it the moment
         * the exit begins — otherwise a still-playing entrance tween can
         * re-render shared elements AFTER the scrubbed exit wrote its values.
         */
        exit.eventCallback("onStart", () => {
          if (intro.progress() < 1) intro.progress(1).pause();
        });

        exit
          // 1. Copy blurs away
          .to(
            "[data-hero-eyebrow], [data-hero-sub], [data-hero-cta]",
            {
              opacity: 0,
              y: -42,
              filter: "blur(12px)",
              duration: 0.2,
              stagger: 0.015,
              ease: "power1.in",
              overwrite: "auto",
            },
            0.02,
          )
          // 2. Headline dissolves letter by letter
          .to(
            split.chars,
            {
              opacity: 0,
              filter: "blur(8px)",
              scale: 0.94,
              y: () => gsap.utils.random(-72, 44),
              duration: 0.42,
              stagger: { each: 0.012, from: "random" },
            },
            0.08,
          )
          // 3. Product inches closer
          .to(
            "[data-hero-visual] img",
            { scale: 1.16, duration: 0.85, ease: "power1.inOut" },
            0.05,
          )
          // 4. Iris ring closes on the lens
          .set("[data-iris-ring], [data-iris-veil]", { opacity: 1 }, 0.34)
          .fromTo(
            "[data-iris-hole], [data-iris-ring]",
            { attr: { r: 82 } },
            {
              attr: { r: 0 },
              duration: 0.6,
              ease: "power2.in",
            },
            0.36,
          )
          .to(
            "[data-iris-ring]",
            { attr: { "stroke-width": 2.4 }, duration: 0.5 },
            0.42,
          )
          .to("[data-iris-ring]", { opacity: 0, duration: 0.05 }, 0.93)
          // 5. Frame goes to black
          .to("[data-hero-blackout]", { opacity: 1, duration: 0.4 }, 0.5)
          .to({}, { duration: 0.08 }); // hold on black
      }
    }, root);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [active, isMobile]);

  return (
    <section ref={rootRef} id="top" aria-label="OBSCURA ONE introduction">
      <div className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-5 pb-6 pt-[13vh] md:pt-[15vh]">
        {/* Camera visual — rises from the bottom edge, lens near center */}
        <div
          data-hero-visual
          className="pointer-events-none absolute bottom-0 left-1/2 z-0 aspect-square w-[min(80vw,52vh)] -translate-x-1/2 translate-y-[29%]"
        >
          <Image
            src="/images/hero-camera.png"
            alt="OBSCURA ONE compact camera, front view with ƒ/1.7 prime lens"
            fill
            priority
            sizes="88vw"
            className="object-cover [mask-image:radial-gradient(closest-side,black_62%,transparent_99%)]"
          />

          {/* Iris close overlay — centered on the lens */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <mask id="hero-iris-mask">
                <rect x="-5" y="-5" width="110" height="110" fill="#fff" />
                <circle
                  data-iris-hole
                  cx="50"
                  cy="50"
                  r="82"
                  fill="#000"
                />
              </mask>
            </defs>
            <rect
              data-iris-veil
              x="-5"
              y="-5"
              width="110"
              height="110"
              fill="#050506"
              mask="url(#hero-iris-mask)"
              opacity="0"
            />
            <circle
              data-iris-ring
              cx="50"
              cy="50"
              r="82"
              fill="none"
              stroke="#ff5a1f"
              strokeWidth="0.8"
              opacity="0"
              style={{ filter: "drop-shadow(0 0 5px rgba(255,90,31,0.9))" }}
            />
          </svg>
        </div>

        {/* Copy stack */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <p
            data-hero-eyebrow
            className="eyebrow flex items-center gap-2.5 rounded-full border border-hairline bg-surface-1/70 px-4 py-2 backdrop-blur-md"
          >
            <span className="glow-dot" aria-hidden="true" />
            Obscura One — 61MP full-frame compact
          </p>

          <h1
            ref={h1Ref}
            className="display-1 mt-7 max-w-[14ch] text-balance text-cream"
          >
            See in the dark.
          </h1>

          <p
            data-hero-sub
            className="mt-7 max-w-md text-balance text-[15px] leading-relaxed text-fog md:text-base"
          >
            A 61-megapixel full-frame sensor, a ƒ/1.7 ASPH. prime and 282 grams
            of machined aluminum. The compact camera, perfected.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              data-hero-cta
              type="button"
              onClick={() => scrollToId(lenis, "preorder")}
              className="btn-pill btn-primary px-7"
            >
              Pre-order — $1,299
            </button>
            <button
              data-hero-cta
              type="button"
              onClick={() => scrollToId(lenis, "optics")}
              className="btn-pill btn-ghost"
            >
              Explore the optics
              <span aria-hidden="true" className="text-signal">
                ↓
              </span>
            </button>
          </div>
        </div>

        {/* Library tag — bottom-left, clear of the product */}
        <div className="absolute bottom-6 left-5 z-10 md:bottom-8 md:left-10">
          <SectionTag
            lib="GSAP"
            sub="SplitText"
            enabled={motionOn}
            onToggle={setMotionOn}
          />
        </div>

        {/* Full-frame blackout used by the exit */}
        <div
          data-hero-blackout
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-[#050506] opacity-0"
        />
      </div>
    </section>
  );
}
