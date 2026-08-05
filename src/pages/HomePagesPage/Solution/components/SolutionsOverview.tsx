"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { BatteryCharging, Network, Layers, CheckCircle, PhoneCall, RotateCcw, Mail, Phone, MapPin } from "lucide-react";
import { fetchAllSolutions } from "../../../../services/Ecommerce/solutionsOverviewServices";
import { useQuery } from "@tanstack/react-query";

import "../../../../assets/css/Solutions.css";
import "../../../../assets/css/global.css";

/* Dummy image for SupportServices */
import image from "../../../../../public/Bee14.jpg";

const UnifiedPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /** ==================== SOLUTIONS SECTION ==================== */
  const solutionsRef = useRef<HTMLDivElement | null>(null);
  const solutionsControls = useAnimation();
  const solutionsInView = useInView(solutionsRef, { 
    once: false, 
    amount: 0.1
  });

  useEffect(() => {
    if (isMobile) {
      solutionsControls.start("visible");
    } else if (solutionsInView) {
      solutionsControls.start("visible");
    } else {
      solutionsControls.start("hidden");
    }
  }, [solutionsInView, solutionsControls, isMobile]);

  const iconMap: Record<string, any> = { BatteryCharging, Network };
  const { data: solutionsResponse } = useQuery({
    queryKey: ["solutions"],
    queryFn: () => fetchAllSolutions(),
  });
  const solutions = solutionsResponse || [];

  /** ==================== SUPPORT SECTION ==================== */
  const supportLeftRef = useRef<HTMLDivElement | null>(null);
  const supportRightRef = useRef<HTMLDivElement | null>(null);
  
  const supportLeftControls = useAnimation();
  const supportLeftInView = useInView(supportLeftRef, { 
    once: isMobile, 
    amount: 0.1
  });

  const supportRightControls = useAnimation();
  const supportRightInView = useInView(supportRightRef, { 
    once: isMobile, 
    amount: 0.1
  });

  useEffect(() => {
    if (isMobile) {
      supportLeftControls.start("visible");
    } else if (supportLeftInView) {
      supportLeftControls.start("visible");
    } else {
      supportLeftControls.start("hidden");
    }
  }, [supportLeftInView, supportLeftControls, isMobile]);

  useEffect(() => {
    if (isMobile) {
      supportRightControls.start("visible");
    } else if (supportRightInView) {
      supportRightControls.start("visible");
    } else {
      supportRightControls.start("hidden");
    }
  }, [supportRightInView, supportRightControls, isMobile]);

  const supportFeatures = [
    { icon: PhoneCall, title: "Local Support", desc: "Talk directly with our local support experts." },
    { icon: RotateCcw, title: "Request a Callback", desc: "Leave a request and we'll reach out at your convenience." },
    { icon: Mail, title: "Ask-A-Question", desc: "Send your query anytime we'll reply by email promptly." },
  ];

  const contactInfo = [
    { icon: Phone, title: "SALES", desc: "+63 927 609 3575" },
    { icon: Mail, title: "SUPPORT", desc: "info@beese.ph" },
    { icon: MapPin, title: "ADDRESS", desc: "#65-D Scout Borromeo, South Triangle, Quezon City" },
  ];

  /** ==================== ANIMATION VARIANTS ==================== */
  const solutionsVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: isMobile ? 0 : 0.8,
        staggerChildren: isMobile ? 0 : 0.1
      }
    }
  };

  const solutionsChildVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      y: isMobile ? 0 : 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.8
      }
    }
  };

  const supportLeftVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: isMobile ? 0 : -30
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        staggerChildren: isMobile ? 0 : 0.15
      }
    }
  };

  const supportRightVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: isMobile ? 0 : 30
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        delay: isMobile ? 0 : 0.2
      }
    }
  };

  const supportFeatureVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: isMobile ? 0 : -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.6
      }
    }
  };

  return (
    <div ref={containerRef} className="relative bg-[#000000] min-h-screen w-full">

      {/* ==================== SOLUTIONS SECTION ==================== */}
      <section
        ref={solutionsRef}
        className="relative w-full pt-16 sm:pt-20 md:pt-32 lg:pt-40 pb-16 sm:pb-24 md:pb-32 lg:pb-40 px-4 sm:px-6 md:px-8 lg:px-10"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url('/servicesBg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* OPTIMIZED GOLD + BLACK FADE LAYERS WITH SMOOTH TRANSITIONS */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(0,0,0,0.9) 0%,
                rgba(0,0,0,0.8) 8%,
                rgba(0,0,0,0.65) 16%,
                rgba(0,0,0,0.45) 24%,
                rgba(0,0,0,0.25) 32%,
                rgba(0,0,0,0.1) 40%,
                rgba(0,0,0,0) 50%
              ),
              linear-gradient(
                to bottom,
                rgba(253,204,0,0.35) 0%,
                rgba(253,204,0,0.28) 12%,
                rgba(253,204,0,0.2) 25%,
                rgba(253,204,0,0.14) 40%,
                rgba(253,204,0,0.08) 60%,
                rgba(253,204,0,0.03) 80%,
                rgba(253,204,0,0) 100%
              ),
              radial-gradient(
                ellipse at top center,
                rgba(253,204,0,0.25) 0%,
                rgba(253,204,0,0.15) 20%,
                rgba(253,204,0,0.08) 40%,
                transparent 65%
              ),
              radial-gradient(
                ellipse at bottom center,
                rgba(0,0,0,0.6) 0%,
                rgba(0,0,0,0.3) 30%,
                transparent 60%
              ),
              linear-gradient(
                to top,
                rgba(0,0,0,0.95) 0%,
                rgba(0,0,0,0.85) 8%,
                rgba(0,0,0,0.65) 20%,
                rgba(0,0,0,0.4) 35%,
                rgba(0,0,0,0.2) 55%,
                rgba(0,0,0,0.08) 75%,
                rgba(0,0,0,0) 100%
              )
            `,
          }}
        />

        <motion.div
          initial="hidden"
          animate={solutionsControls}
          variants={solutionsVariants}
          className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 text-center mb-12 sm:mb-16 md:mb-20 w-full"
        >

          {/* Title */}
          <motion.h2
            variants={solutionsChildVariants}
            className="bee-title-lg text-[var(--beesee-gold)] tracking-wide px-2 sm:px-4"
          >
            COMPLETE INFRASTRUCTURE SOLUTIONS
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            variants={solutionsChildVariants}
            className="bee-body-lg max-w-2xl mx-auto mt-4 sm:mt-6 leading-relaxed px-4 sm:px-6"
          >
            From high-performance servers to comprehensive cloud infrastructure, our enterprise solutions are designed to scale with your business needs while maintaining the highest standards of reliability and security.
          </motion.p>
        </motion.div>

        {/* SOLUTION BLOCKS */}
        <motion.div 
          initial="hidden"
          animate={solutionsControls}
          variants={solutionsVariants}
          className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 w-full"
        >
          {solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon] || Network;

            return (
              <motion.div 
                key={solution.id}
                variants={solutionsChildVariants}
                className={`grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center w-full ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* TEXT SIDE */}
                <motion.div
                  variants={solutionsChildVariants}
                  className={`space-y-4 sm:space-y-6 w-full ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg border border-[#FDCC00]/35 flex items-center justify-center bg-[#FDCC00]/10 flex-shrink-0">
                      <IconComponent size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-[var(--beesee-gold)]" />
                    </div>
                    <h3 className="bee-title-sm text-[var(--beesee-gold)] leading-tight">{solution.title}</h3>
                  </div>

                  <p className="bee-body-lg text-white/90 leading-relaxed">{solution.description}</p>

                  <div className="space-y-2 sm:space-y-3 w-full">
                    <h4 className="bee-body font-semibold text-white">Key Features</h4>
                    <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                      {solution.features.map((feature, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2"
                        >
                          <CheckCircle size={14} className="sm:w-4 sm:h-4 text-[var(--beesee-gold)] mt-0.5 flex-shrink-0" />
                          <span className="bee-body-sm text-white/75">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg border border-[#FDCC00]/25 p-4 sm:p-5">
                    <h4 className="bee-body font-semibold text-white mb-2 sm:mb-3">Technical Specifications</h4>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      {Object.entries(solution.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="bee-body-sm opacity-70 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="bee-body-lg text-white font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* IMAGE SIDE */}
                <motion.div
                  variants={solutionsChildVariants}
                  className={`w-full ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <div className="relative backdrop-blur-md rounded-lg p-3 sm:p-4 border border-[#FDCC00]/25">
                    <img 
                      src={solution.image_url} 
                      className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded" 
                      alt={solution.title} 
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ==================== SUPPORT SERVICES SECTION ==================== */}
      <section className="relative w-full py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#000000]">
        {/* Top Fade to fix overlay issue */}
        <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)'
          }}
        ></div>

        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-4 sm:left-10 w-48 h-48 sm:w-60 sm:h-60 bg-[#FDCC00]/20 blur-2xl rounded-full"></div>
          <div className="absolute bottom-10 right-4 sm:right-10 w-60 h-60 sm:w-72 sm:h-72 bg-[#FFD700]/15 blur-2xl rounded-full"></div>
        </div>

        {/* Bottom Fade to Black for Smooth Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,1) 100%)'
          }}
        ></div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <motion.div 
            ref={supportLeftRef}
            initial="hidden"
            animate={supportLeftControls}
            variants={supportLeftVariants}
            className="w-full"
          >


            <h2
              className="bee-title-md text-[#FDCC00] tracking-wide leading-tight mb-4 sm:mb-6"
            >
             WE'RE HERE FOR YOU
            </h2>

            <p
              className="bee-body-lg mb-6 sm:mb-8 max-w-xl text-white/85"
            >
              Get the help you need, anytime, anywhere. BeeSee ensures you stay connected and supported because we believe great technology deserves great care.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4 sm:space-y-5 mb-10">
              {supportFeatures.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={supportFeatureVariants}
                    className="group relative flex items-start gap-3 sm:gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-[#FDCC00]/20 p-3 sm:p-4 rounded-lg hover:border-[#FDCC00]/50 hover:shadow-lg hover:shadow-[#FDCC00]/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#FDCC00]/5 via-transparent to-[#FFD700]/5 pointer-events-none"></div>

                    <div className="relative p-2 sm:p-3 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10 rounded-full border border-[#FDCC00]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-[#FDCC00]" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white mb-1 group-hover:text-[#FDCC00] transition-colors duration-300 tracking-wide"
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[#C7B897]/80 leading-relaxed group-hover:text-[#C7B897]/100 transition-colors duration-300"
                        style={{
                          fontSize: '0.95rem',
                          lineHeight: '1.6',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

        
          </motion.div>

          {/* Right Image */}
          <motion.div
            ref={supportRightRef}
            initial="hidden"
            animate={supportRightControls}
            variants={supportRightVariants}
            className="flex justify-center lg:justify-end mt-8 lg:mt-0 w-full"
          >
            <div className="relative group w-full max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/20 rounded-lg sm:rounded-2xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 scale-105"></div>
              <div className="relative rounded-lg sm:rounded-2xl overflow-hidden border-2 border-[#FDCC00]/30 shadow-2xl shadow-[#FDCC00]/20 group-hover:border-[#FDCC00]/50 transition-all duration-500 group-hover:scale-[1.02]">
                <img src={image} alt="Customer Support" className="w-full h-auto object-cover min-h-64 sm:min-h-80 md:min-h-96" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent pointer-events-none"></div>
              </div>
              <div className="absolute top-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-t-2 border-l-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 rounded-tl-lg sm:rounded-tl-2xl transition-all duration-500"></div>
              <div className="absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-r-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 rounded-br-lg sm:rounded-br-2xl transition-all duration-500"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedPage;