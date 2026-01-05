"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import Hero from "./components/Hero";
import ContactSection from "./components/ContactSection";
import SectionTwo from "./components/SectionTwo";

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
	target: containerRef,
	offset: ["start start", "end start"],
  });

  return (
	<div ref={containerRef} className="relative w-full overflow-x-hidden">
	  {/* HERO FIXED */}
	  <div className="fixed top-0 left-0 w-full h-screen z-[1]">
		<Hero scrollYProgress={scrollYProgress} />
	  </div>

	  {/* NORMAL CONTENT — starts after 1.5 scroll */}
	  <div className="mt-[150vh] w-full bg-black relative z-[20]">
    <SectionTwo />
		<ContactSection />
	  </div>
	</div>
  );
}