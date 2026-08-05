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
  const [key, setKey] = useState(Date.now()); // Add key for forced remount

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
      
      // Reset scroll position when component mounts
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Generate new key to force component remount
      setKey(Date.now());
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }
  }, []);

  // Simple container without conflicting animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <div className="about-page">
      {/* REMOVED: motion.main wrapper with animations */}
      <div className="about-main">
        <HeroSection />
        
        {/* Conditionally render stepper section based on screen size */}
        {/* Add key prop to force complete remount when navigating back */}
        {isMobile ? (
          <StepperSectionMobile key={`mobile-${key}`} />
        ) : (
          <StepperSectionDesktop key={`desktop-${key}`} />
        )}
        
        {/* If you have other components, add them here */}
        {/* <CompanyStory /> */}
        {/* <PhilippineHeritage /> */}
      </div>
    </div>
  );
};

export default AboutUs;