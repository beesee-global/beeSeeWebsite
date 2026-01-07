// src/pages/About/AboutUs.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSection from "./components/HeroSection";
import CompanyStory from "./components/CompanyStory";
import StepperSectionDesktop from "./components/StepperSectionDesktop";
import StepperSectionMobile from "./components/StepperSectionMobile";
import PhilippineHeritage from "./components/PhilippineHeritage";
import "../../../assets/css/About.css";

const AboutUs: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.title = "About - Beesee Global Technology Inc.";
    
    // Check if window is defined (for SSR compatibility)
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Initial check
      checkMobile();
      
      // Add resize listener
      window.addEventListener('resize', checkMobile);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="about-page">  {/* ← REMOVED pt-[80px] */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="about-main"
      >
        <HeroSection />
        
        {/* Conditionally render stepper section based on screen size */}
        {isMobile ? (
          <StepperSectionMobile />
        ) : (
          <StepperSectionDesktop />
        )}
        
        {/* If you have other components, add them here */}
        {/* <CompanyStory /> */}
        {/* <PhilippineHeritage /> */}
      </motion.main>
    </div>
  );
};

export default AboutUs;