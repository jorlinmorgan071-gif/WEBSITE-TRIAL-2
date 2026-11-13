import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://obscura-one.example.com"),
  title: "OBSCURA ONE — See in the dark.",
  description:
    "A 61MP full-frame sensor, a ƒ/1.7 ASPH. prime and 282 grams of machined aluminum. The compact camera, perfected. A motion-design launch site built with Lenis, GSAP, Motion, Anime.js and React Three Fiber.",
  keywords: [
    "OBSCURA ONE",
    "compact camera",
    "launch site",
    "GSAP",
    "Motion",
    "Anime.js",
    "React Three Fiber",
    "motion design",
  ],
  authors: [{ name: "Obscura Design Studio" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "OBSCURA ONE — See in the dark.",
    description:
      "The compact camera, perfected. A motion-design launch site built with Lenis, GSAP, Motion, Anime.js and React Three Fiber.",
    siteName: "OBSCURA",
    type: "website",
    images: [{ url: "/images/hero-camera.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OBSCURA ONE — See in the dark.",
    description:
      "The compact camera, perfected. A motion-design launch site.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} bg-ink font-sans text-cream antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
