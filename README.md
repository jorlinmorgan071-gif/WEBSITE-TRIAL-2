# OBSCURA ONE

**A compact-camera launch site that feels like an Apple keynote rendered by a motion studio.**

OBSCURA ONE is a concept product — a 61MP full-frame compact with a ƒ/1.7 prime — and this is its launch page. It is also a working reference implementation of a modern, multi-library motion architecture: every section demonstrates one motion library where it is strongest, with toggleable library tags so you can see exactly what each engine contributes.

---

## Highlights

| # | Section | Engine | What it demonstrates |
|---|---------|--------|----------------------|
| 00 | Global scroll | **Lenis** | Smooth scroll synced to the GSAP ticker — a single rAF loop drives both engines, so pins never drift |
| 01 | Hero | **GSAP · SplitText** | Headline rises out of line masks; on scroll the section pins and plays a deliberate exit — copy blurs away, the headline dissolves letter by letter, and a signal-orange iris ring closes on the lens until the frame is black |
| 02 | Optics | **GSAP · ScrollTrigger** | Pinned, scrubbed lens zoom with orange leader lines that draw in, one callout at a time |
| 03 | Numbers | **Motion** | Asymmetric bento grid with count-up statistics and a pointer-tracking spotlight card |
| 04 | Controls | **Motion** | Master-detail list with a shared-layout indicator (`layoutId`) and `AnimatePresence` crossfades |
| 05 | Field | **GSAP · ScrollTrigger** | Pinned horizontal gallery pan with per-image parallax and a scrubbed progress hairline |
| 06 | Iris | **Anime.js** | A draggable 9-blade SVG aperture — rotate the ring and depth of field collapses live as the photo blurs |
| 07 | Lens | **React Three Fiber** | A procedurally-modeled lens (machined barrel, 72-ridge knurl, coated glass) that is lazily mounted and rotatable by pointer |
| 08 | Playground | **All four** | The exact same stagger-rise effect written in GSAP, Motion, Anime.js and CSS — switch engines and replay |

Every section header carries a small mono library tag. Click it to toggle that section's motion off and inspect the static fallback.

## Design system

- **Locked dark theme** — near-black `#0b0b0c` ground, `#111113` / `#17171a` surfaces, warm off-white `#ededea` text, muted `#8f8f93` secondary
- **One ownable accent** — signal orange `#ff5a1f`, reserved for CTAs, leader lines, focus rings and glows
- **Type** — Geist Sans for text, Geist Mono for numbers and specs; display headings at `-0.045em` tracking with sub-1 line-height
- **Geometry** — full-pill buttons, 20px-radius card panels, hairline borders at 8% white
- **Texture** — a faint animated film-grain overlay across the entire page
- **Layout** — asymmetric bento grids, master-detail lists and full-bleed product imagery; no centered template grids

## Accessibility and resilience

- **Reduced motion, fully honored** — `prefers-reduced-motion` disables Lenis, all pins, the SplitText entrance and every decorative animation; content renders in its final state
- **Mobile fallbacks** — pinned scrub sections become static layouts or native snap scrollers below `md`; the 3D scene degrades to photography if WebGL is unavailable
- **Keyboard support** — the iris ring is a real `role="slider"` (arrow keys, Home/End), the nav and playground are tab/ARIA compliant, focus rings are signal orange
- **No bouncy easing** — expo/power curves everywhere; springs only where physically motivated (magnetic CTA, shared-layout pills)

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript 5
- [Tailwind CSS 4](https://tailwindcss.com/) (CSS-first configuration)
- [GSAP 3](https://gsap.com/) — SplitText + ScrollTrigger (pinned scrubs)
- [Motion](https://motion.dev/) — layout animations, springs, count-ups, scroll-aware nav
- [Anime.js 4](https://animejs.com/) — the draggable aperture iris
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + drei — the 3D lens
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll

## Getting started

```bash
# install
bun install        # or npm install / pnpm install

# develop
bun run dev        # http://localhost:3000

# produce
bun run build && bun run start

# check
bun run lint
```

No environment variables, no database, no external services — the site is fully self-contained.

## Project structure

```
src/
  app/
    globals.css        # design tokens, grain, marquee, pill buttons, reduced-motion rules
    layout.tsx         # Geist fonts, metadata, locked dark shell
    page.tsx           # section composition
  components/
    smooth-scroll.tsx  # Lenis <-> GSAP ticker sync, exposed via useSyncExternalStore
    nav.tsx            # hide-on-scroll nav, shared-layout pills, magnetic CTA
    hero.tsx           # SplitText entrance + pinned iris-close exit
    marquee.tsx        # CSS spec ticker
    lens-zoom.tsx      # pinned scrub zoom + drawing callout lines
    bento.tsx          # count-up numbers, pointer spotlight card
    master-detail.tsx  # shared-layout master-detail list
    gallery.tsx        # pinned horizontal pan with parallax
    aperture.tsx       # draggable 9-blade Anime.js iris + live DOF blur
    lens-3d.tsx        # lazy loader + WebGL boundary
    lens-3d-scene.tsx  # R3F scene (barrel, knurl, glass, local Lightformers)
    playground.tsx     # one effect, four engines
    cta-footer.tsx     # full-bleed finale + credits
    section-tag.tsx    # toggleable mono library tag
    grain.tsx          # film-grain overlay
  lib/
    gsap.ts            # plugin registration + defaults
    hooks.ts           # usePrefersReducedMotion, useIsMobile (SSR-safe)
public/images/         # generated product photography
```

## Implementation notes

- **One rAF to rule them all.** Lenis emits scroll updates into `ScrollTrigger.update`, and its `raf()` runs inside `gsap.ticker` — pins stay phase-locked with the smoothed scroll position.
- **The iris is real geometry.** Nine blades are chord-clipped rectangles rotating around the circle center; opening the iris also eases the photo's `filter: blur()` and scale, mapping aperture to depth of field.
- **Engine parity is the point.** The playground's four implementations use the same 26px rise, 10px blur, 45ms stagger and expo-out curve — `expo.out`, `[0.16, 1, 0.3, 1]`, `outExpo`, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Race-safe entrances.** The hero completes its entrance the instant the pinned exit begins, so a fast scroll can never leave shared elements in a half-tweened state.
- **Local-only 3D.** The R3F environment map is generated from drei `Lightformer`s at runtime — no network fetches, no HDR files.

## License

Concept work. Product, brand and specifications are fictional; photography is AI-generated. Code is released under the [MIT License](LICENSE).
