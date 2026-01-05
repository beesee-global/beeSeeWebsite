"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import HeroSection from "./components/HeroSection";
import SolutionsOverview from "./components/SolutionsOverview";
import SupportServices from "./components/SupportServices";
import ContactCTA from "./components/ContactCTA";

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

<<<<<<< Updated upstream
  /* EXACT COPY FROM HOMEPAGE LOGIC */
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
=======
  /** ------------------ Hero Height ------------------ */
  useEffect(() => {
    const updateHeight = () => {
      if (heroRef.current) setHeroHeight(heroRef.current.scrollHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /** ------------------ Hero Scroll Effect ------------------ */
  const { scrollY } = useScroll();
  // Fade out over the full hero height
  const heroOpacity = useTransform(scrollY, [0, heroHeight], [1, 0]);
  const heroY = useTransform(scrollY, [0, heroHeight], [0, -50]); // optional parallax
>>>>>>> Stashed changes

  useEffect(() => {
    document.title = "Solutions - Beesee Global Technology Inc.";
  }, []);

  useEffect(() => {
    // Force reflow to ensure scroll is registered
    window.scrollTo(0, 0);
    
    // Ensure document is scrollable
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    
    if (containerRef.current) {
      containerRef.current.style.overflow = "visible";
    }

    // Force a small scroll trigger to initialize the scroll listener
    setTimeout(() => {
      window.dispatchEvent(new Event("scroll"));
    }, 10);

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">

      {/* HERO FIXED */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="fixed top-0 left-0 w-full h-screen z-[1]"
      >
        <HeroSection />
      </motion.div>

      {/* NORMAL CONTENT — starts after 1.5 scroll */}
      <div className="mt-[150vh] w-full bg-black relative z-[20]">
        <SolutionsOverview />
      </div>

    </div>
  );
};

export default LandingPage;
