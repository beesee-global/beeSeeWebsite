"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

import Hero from "./components/Hero";
import SectionTwo from "./components/SectionTwo";
import SectionThree from "./components/SectionThree";
import DigitalConnection from "./components/DigitalConnection";
import ContactSection from "./components/ContactSection";

export default function HomePage() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // 1.5 scroll effect
  const sectionTwoY = useTransform(scrollYProgress, [0, 1], ["100vh", "0vh"]);
  const sectionTwoOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">

      {/* HERO FIXED */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="fixed top-0 left-0 w-full h-screen z-[1]"
      >
        <Hero scrollYProgress={scrollYProgress} />
      </motion.div>

      {/* NORMAL CONTENT — starts after 1.5 scroll */}
      <div className="mt-[150vh] w-full bg-black relative z-[20]">
        <SectionTwo />
        <ContactSection />
      </div>

    </div>
  );
}
