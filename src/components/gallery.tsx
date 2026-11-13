"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion, useIsMobile } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";
import { scrollToId, useLenis } from "@/components/smooth-scroll";

const SHOTS = [
  {
    img: "/images/gallery-1.png",
    alt: "The OBSCURA ONE on dark slate under a single spotlight",
    caption: "01 — STUDIO · 1/250 · ƒ/5.6 · ISO 100",
    cls: "h-[62vh] w-[42vw] min-w-[300px] md:h-[66vh] lg:w-[30vw]",
  },
  {
    img: "/images/gallery-2.png",
    alt: "The OBSCURA ONE held in hand on a city street at night",
    caption: "02 — STREET · 1/125 · ƒ/1.7 · ISO 3200",
    cls: "mt-[8vh] h-[48vh] w-[36vw] min-w-[260px] md:h-[52vh] lg:w-[26vw]",
  },
  {
    img: "/images/gallery-5.png",
    alt: "Cinematic studio shot of the OBSCURA ONE under a hard beam of light",
    caption: "03 — LIGHT STUDY · 1/60 · ƒ/2.8 · ISO 800",
    cls: "h-[56vh] w-[56vw] min-w-[340px] md:h-[64vh] lg:w-[44vw]",
  },
  {
    img: "/images/gallery-3.png",
    alt: "Flat lay of the OBSCURA ONE with its leather strap",
    caption: "04 — FLAT LAY · 1/200 · ƒ/8 · ISO 200",
    cls: "mt-[10vh] h-[52vh] w-[44vw] min-w-[280px] md:h-[58vh] lg:w-[34vw]",
  },
  {
    img: "/images/gallery-4.png",
    alt: "The OBSCURA ONE on a travel tripod in fog at blue hour",
    caption: "05 — FOG · 8S · ƒ/11 · ISO 100",
    cls: "h-[64vh] w-[36vw] min-w-[260px] md:h-[70vh] lg:w-[26vw]",
  },
] as const;

/** GSAP ScrollTrigger — pinned horizontal gallery pan with inner parallax. */
export function Gallery() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const lenis = useLenis();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || !active || isMobile) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;

      const pan = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gallery-pin]",
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* Inner parallax — images drift against the pan direction. */
      gsap.utils.toArray<HTMLElement>("[data-gallery-img]").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest("[data-gallery-figure]") as Element,
              containerAnimation: pan,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });

      /* Progress hairline. */
      gsap.fromTo(
        "[data-gallery-progress]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-gallery-pin]",
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [active, isMobile]);

  const header = (
    <div className="flex flex-col justify-between md:h-[66vh]">
      <div>
        <p className="eyebrow">05 · Field</p>
        <h2 className="display-2 mt-4 text-balance text-cream">
          In the field.
          <br />
          <span className="text-fog">Not on a chart.</span>
        </h2>
        <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-fog">
          Five frames from the first production bodies. No retouching, no
          composites — straight off the sensor.
        </p>
      </div>
      <div className="flex items-end justify-between gap-6 md:flex-col md:items-start">
        <SectionTag
          lib="GSAP"
          sub="ScrollTrigger pin"
          enabled={motionOn}
          onToggle={setMotionOn}
        />
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-fog md:block">
          {active && !isMobile ? "Scroll to pan →" : ""}
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <section ref={rootRef} id="field" aria-label="Gallery" className="relative">
        <div className="container-x py-20">
          {header}
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6">
          {SHOTS.map((s) => (
            <figure
              key={s.img}
              data-gallery-figure
              className="w-[82vw] shrink-0 snap-center"
            >
              <div className="card-panel relative h-[56vh] overflow-hidden">
                <Image
                  src={s.img}
                  alt={s.alt}
                  fill
                  sizes="82vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
                {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} id="field" aria-label="Gallery" className="relative">
      <div
        data-gallery-pin
        className="relative h-[100svh] overflow-hidden border-y border-hairline bg-surface-1/30"
      >
        <div
          ref={trackRef}
          className="flex h-full items-center gap-10 px-10 md:gap-16 md:px-16"
          style={{ width: "max-content" }}
        >
          <div className="w-[38vw] min-w-[380px] max-w-[520px]">{header}</div>

          {SHOTS.map((s) => (
            <figure key={s.img} data-gallery-figure className="shrink-0">
              <div className={`card-panel relative overflow-hidden ${s.cls}`}>
                <div className="absolute -inset-x-[6%] inset-y-0">
                  <Image
                    data-gallery-img
                    src={s.img}
                    alt={s.alt}
                    fill
                    sizes="50vw"
                    className="object-cover will-change-transform"
                  />
                </div>
              </div>
              <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
                {s.caption}
              </figcaption>
            </figure>
          ))}

          {/* End card */}
          <div className="flex h-[52vh] w-[34vw] min-w-[300px] shrink-0 flex-col items-start justify-center">
            <p className="display-3 text-balance text-cream">
              Shot on OBSCURA ONE.
            </p>
            <button
              type="button"
              onClick={() => scrollToId(lenis, "preorder")}
              className="btn-pill btn-primary mt-6"
            >
              Pre-order — $1,299
            </button>
          </div>
        </div>

        {/* Progress hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]">
          <div
            data-gallery-progress
            className="h-full origin-left bg-signal shadow-[0_0_12px_rgba(255,90,31,0.7)]"
          />
        </div>
      </div>
    </section>
  );
}
