"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import HeroSection from "./components/HeroSection";
import SolutionsOverview from "./components/SolutionsOverview";

const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  /** ------------------ FORCE SCROLL TO TOP ON LOAD ------------------ */
  useEffect(() => {
    // reset browser scroll
    window.scrollTo(0, 0);

    // reset container scroll (IMPORTANT)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  /** ------------------ Detect Mobile ------------------ */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /** ------------------ Hero Height ------------------ */
  useEffect(() => {
    const updateHeight = () => {
      if (heroRef.current) {
        setHeroHeight(heroRef.current.scrollHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /** ------------------ Hero Scroll Effect ------------------ */
  const { scrollY } = useScroll({
    container: containerRef,
  });

  const heroOpacity = useTransform(scrollY, [0, heroHeight], [1, 0]);
  const heroY = useTransform(scrollY, [0, heroHeight], [0, -50]);

  useEffect(() => {
    document.title = "Solutions - Beesee Global Technology Inc.";
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-x-hidden scroll-smooth"
    >
      {/* ==================== HERO ==================== */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, y: isMobile ? 0 : heroY }}
        className={`${isMobile ? "relative" : "fixed"} top-0 left-0 w-full ${
          isMobile ? "h-auto" : "h-screen"
        } z-[10]`}
      >
        <HeroSection />
      </motion.div>

      {/* ==================== PAGE CONTENT ==================== */}
      <div
        className="relative z-[20] w-full"
        style={{ marginTop: isMobile ? 0 : heroHeight }}
      >
        <SolutionsOverview />
      </div>
    </div>
  );
};

export default LandingPage;
