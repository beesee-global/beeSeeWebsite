// src/pages/About/AboutUs.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "./components/HeroSection";
import CompanyStory from "./components/CompanyStory";
import StepperSection from "./components/StepperSection";
import PhilippineHeritage from "./components/PhilippineHeritage";
import "../../../assets/css/About.css";


const AboutUs: React.FC = () => {
  useEffect(() => {
    document.title = "About - Beesee Global Technology Inc.";
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
    <div className="about-page pt-[80px]">  {/* ← FIXED, removed min-h-screen */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="about-main"
      >
        <HeroSection />
        <StepperSection />
      </motion.main>
    </div>
  );
};

export default AboutUs;
