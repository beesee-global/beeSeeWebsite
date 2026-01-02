// components/ParallaxText.tsx
"use client";

import React, { useEffect, useRef } from "react";

type ParallaxTextProps = {
  children: React.ReactNode;
  // speed: smaller = slower movement (0.1..1). Positive moves opposite to scroll (slower),
  // negative will invert direction. Default is 0.25 for a subtle effect.
  speed?: number;
  className?: string;
  // max translate in px to avoid extreme shifts on large screens
  maxTranslate?: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export default function ParallaxText({
  children,
  speed = 0.25,
  className = "",
  maxTranslate = 60,
}: ParallaxTextProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef<number>(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Respect user motion preference
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (elRef.current) {
        elRef.current.style.transform = "none";
      }
      return;
    }

    const onFrame = () => {
      const node = elRef.current;
      if (!node) return;

      // Get viewport scroll position and element bounding rect
      const scrollY = window.scrollY || window.pageYOffset;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Compute element center relative to viewport center (-1 to 1)
      const elementCenterY = rect.top + rect.height / 2;
      const viewportCenterY = viewportHeight / 2;
      const relative = (elementCenterY - viewportCenterY) / (viewportHeight / 2); // -∞..∞ but usually -1..1

      // Desired translate: opposite direction of relative by speed
      // Clamp the computed translation to avoid large jumps on tall pages
      const translate = clamp(-relative * speed * maxTranslate, -maxTranslate, maxTranslate);

      // Use transform with translate3d for GPU acceleration
      node.style.transform = `translate3d(0, ${translate}px, 0)`;

      lastScrollY.current = scrollY;
      rafId.current = requestAnimationFrame(onFrame);
    };

    rafId.current = requestAnimationFrame(onFrame);

    const onScroll = () => {
      // quick guard: ensure there's a RAF running; if not, start one
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(onFrame);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, maxTranslate]);

  return (
    <div
      ref={elRef}
      className={`parallax-text ${className}`}
      aria-hidden="false"
      role="presentation"
      // Accept pointer events by default; set pointer-events: none in CSS if you want it purely decorative
    >
      {children}
    </div>
  );
}
