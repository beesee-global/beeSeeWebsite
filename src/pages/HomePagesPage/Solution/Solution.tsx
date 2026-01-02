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

  /* EXACT COPY FROM HOMEPAGE LOGIC */
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    document.title = "Solutions - Beesee Global Technology Inc.";
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
