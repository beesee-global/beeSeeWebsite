"use client";

import { useScroll } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Hero from "./components/Hero";
import SectionTwo from "./components/SectionTwo";
import { fetchHomepageSettings } from "../../../services/WebsiteConfiguration/websiteConfigurationServices";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [homepageSettings, setHomepageSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const settings = await fetchHomepageSettings();
        if (mounted) setHomepageSettings(settings || {});
      } catch {
        try {
          if (mounted) setHomepageSettings(JSON.parse(localStorage.getItem("beesee-homepage-navigation") || "{}"));
        } catch {
          if (mounted) setHomepageSettings({});
        }
      }
    };
    loadSettings();
    const handleStorage = () => loadSettings();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("beesee-homepage-navigation-change", loadSettings);
    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beesee-homepage-navigation-change", loadSettings);
    };
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
      {homepageSettings.homeHero !== false && (
        <div className="fixed top-0 left-0 w-full h-screen z-[1]">
          <Hero scrollYProgress={scrollYProgress} />
        </div>
      )}

      {/* NORMAL CONTENT — minimal scrolling for mobile */}
      {homepageSettings.homeExplore !== false && (
        <div className={`w-full bg-black relative z-[20] ${homepageSettings.homeHero !== false ? "mt-[150vh] lg:mt-[150vh] md:mt-[105vh] sm:mt-[85vh] xs:mt-[75vh]" : "mt-0"}`}>
          <SectionTwo />
        </div>
      )}
    </div>
  );
}
