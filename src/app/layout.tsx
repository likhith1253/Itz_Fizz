import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velocity — Scroll Car Animation",
  description:
    "A premium scroll-driven hero section animation featuring a car, trail, and scroll-synced letter reveal built with Next.js, GSAP, and Tailwind CSS.",
  keywords: ["scroll animation", "GSAP", "car animation", "Next.js", "frontend", "interactive"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
