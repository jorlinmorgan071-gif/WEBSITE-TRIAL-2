"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { SectionTag } from "@/components/section-tag";

/** Lazy-load the R3F bundle only once the section approaches the viewport. */
const Lens3DScene = dynamic(
  () =>
    import("@/components/lens-3d-scene").then((m) => m.Lens3DScene),
  { ssr: false },
);

/** WebGL error boundary — falls back to the macro photograph. */
class GLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const SPECS = [
  { k: "BARREL", v: "6061-T6 ALUMINUM" },
  { k: "GLASS", v: "4 ASPH. ELEMENTS" },
  { k: "COATING", v: "FLUORITE NANO" },
  { k: "MOUNT", v: "±0.02MM TOLERANCE" },
];

/**
 * React Three Fiber — the lens, lazily mounted and rotatable by pointer.
 */
export function Lens3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [motionOn, setMotionOn] = useState(true);
  const active = motionOn && !reduced;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="lens3d"
      aria-label="Interactive 3D lens"
      className="relative border-y border-hairline bg-surface-1/30"
    >
      <div className="container-x grid grid-cols-1 items-center gap-10 py-24 md:py-36 lg:grid-cols-12 lg:gap-8">
        {/* Copy */}
        <div className="lg:col-span-5">
          <p className="eyebrow">07 · Lens</p>
          <h2 className="display-2 mt-4 text-balance text-cream">
            Hold the optics.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-fog">
            The lens renders here in real time — machined barrel, knurled
            ring, coated glass. Drag to turn it over. It weighs nothing and
            everything at once.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5">
            {SPECS.map((s) => (
              <div key={s.k} className="border-t border-hairline pt-3">
                <dt className="mono-label">{s.k}</dt>
                <dd className="tnum mt-1.5 font-mono text-[13px] tracking-[0.06em] text-cream">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <SectionTag
              lib="R3F"
              sub="three.js"
              enabled={motionOn}
              onToggle={setMotionOn}
            />
            <p className="mono-label">
              {inView ? "Drag to rotate ⟳" : "Loading optics…"}
            </p>
          </div>
        </div>

        {/* 3D stage */}
        <div className="lg:col-span-7">
          <div className="card-panel relative h-[52vh] min-h-[380px] overflow-hidden md:h-[62vh]">
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_42%,rgba(255,90,31,0.07),transparent_70%)]" />
            {inView ? (
              <GLBoundary fallback={<SceneFallback />}>
                <Lens3DScene autoRotate={active} />
              </GLBoundary>
            ) : (
              <SceneFallback loading />
            )}
            <div className="pointer-events-none absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[0.18em] text-fog/80 md:bottom-6 md:left-8">
              OBSCURA 35MM ƒ/1.7 — RENDERED LIVE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/lens-macro.png"
        alt="Macro photograph of the OBSCURA lens front element"
        fill
        sizes="(max-width: 1024px) 100vw, 58vw"
        className="object-cover opacity-60 blur-[1px]"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
        <div className="flex flex-col items-center gap-4">
          <span className="block h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-signal" />
          <span className="mono-label">
            {loading ? "Loading optics" : "WebGL unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
}
