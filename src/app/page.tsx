import { SmoothScrollProvider } from "@/components/smooth-scroll";
import { Grain } from "@/components/grain";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { LensZoom } from "@/components/lens-zoom";
import { Bento } from "@/components/bento";
import { MasterDetail } from "@/components/master-detail";
import { Gallery } from "@/components/gallery";
import { Aperture } from "@/components/aperture";
import { Lens3D } from "@/components/lens-3d";
import { Playground } from "@/components/playground";
import { Cta, Footer } from "@/components/cta-footer";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Grain />
      <Nav />

      <main className="relative">
        {/* 01 — GSAP · SplitText: line-mask entrance + pinned iris exit */}
        <Hero />

        {/* Spec ticker (CSS) */}
        <Marquee />

        {/* 02 — GSAP · ScrollTrigger: pinned scrubbed lens zoom + leader lines */}
        <LensZoom />

        {/* 03 — Motion: count-up numbers, pointer spotlight, bento */}
        <Bento />

        {/* 04 — Motion: master-detail with shared-layout indicator */}
        <MasterDetail />

        {/* 05 — GSAP · ScrollTrigger: pinned horizontal gallery pan */}
        <Gallery />

        {/* 06 — Anime.js: draggable aperture iris + live depth-of-field blur */}
        <Aperture />

        {/* 07 — React Three Fiber: lazily mounted, rotatable lens */}
        <Lens3D />

        {/* 08 — One effect, four engines: GSAP / Motion / Anime.js / CSS */}
        <Playground />

        {/* 09 — Finale */}
        <Cta />
      </main>

      <Footer />
    </SmoothScrollProvider>
  );
}
