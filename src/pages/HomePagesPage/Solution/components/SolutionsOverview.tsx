"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { BatteryCharging, Network, Layers, CheckCircle, PhoneCall, RotateCcw, Mail } from "lucide-react";
import { fetchAllSolutions } from "../../../../services/solutionsOverviewServices";
import { useQuery } from "@tanstack/react-query";

import "../../../../assets/css/Solutions.css";
import "../../../../assets/css/global.css";

/* Dummy image for SupportServices */
import image from "../../../../../public/assets/images/elleAssets/1.jpg";

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

  // Fix for mobile scrolling and prevent horizontal scroll
  useEffect(() => {
    const fixMobileScrolling = () => {
      // Reset any overflow hidden on body and html
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      
      // Prevent horizontal scroll on mobile
      if (isMobile) {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
      }
      
      // Make sure the container allows scrolling
      if (containerRef.current) {
        containerRef.current.style.minHeight = '100vh';
        containerRef.current.style.overflow = 'visible';
      }
    };
    
    fixMobileScrolling();
    window.addEventListener('resize', fixMobileScrolling);
    return () => {
      window.removeEventListener('resize', fixMobileScrolling);
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, [isMobile]);

  /** ==================== SOLUTIONS SECTION ==================== */
  const solutionsRef = useRef<HTMLDivElement | null>(null);
  const solutionsControls = useAnimation();
  const solutionsInView = useInView(solutionsRef, { 
    once: false, 
    amount: 0.1,
    margin: "-50px"
  });

  useEffect(() => {
    if (isMobile) {
      solutionsControls.start("visible"); // Immediately show on mobile
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
  const supportRef = useRef<HTMLDivElement | null>(null);
  const supportLeftRef = useRef<HTMLDivElement | null>(null);
  const supportRightRef = useRef<HTMLDivElement | null>(null);
  
  // Left side animation controls
  const supportLeftControls = useAnimation();
  const supportLeftInView = useInView(supportLeftRef, { 
    once: isMobile, 
    amount: 0.1,
    margin: "-50px"
  });

  // Right side animation controls
  const supportRightControls = useAnimation();
  const supportRightInView = useInView(supportRightRef, { 
    once: isMobile, 
    amount: 0.1,
    margin: "-50px"
  });

  useEffect(() => {
    if (isMobile) {
      supportLeftControls.start("visible"); // Immediately show on mobile
    } else if (supportLeftInView) {
      supportLeftControls.start("visible");
    } else {
      supportLeftControls.start("hidden");
    }
  }, [supportLeftInView, supportLeftControls, isMobile]);

  useEffect(() => {
    if (isMobile) {
      supportRightControls.start("visible"); // Immediately show on mobile
    } else if (supportRightInView) {
      supportRightControls.start("visible");
    } else {
      supportRightControls.start("hidden");
    }
  }, [supportRightInView, supportRightControls, isMobile]);

  const supportFeatures = [
    { icon: PhoneCall, title: "Call Local Support", desc: "Talk directly with our local support experts." },
    { icon: RotateCcw, title: "Request a Callback", desc: "Leave a request and we'll reach out at your convenience." },
    { icon: Mail, title: "Ask-A-Question (After Hours)", desc: "Send your query anytime we'll reply by email promptly." },
  ];

  /** ==================== ANIMATION VARIANTS ==================== */
  const solutionsVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
        staggerChildren: isMobile ? 0 : 0.1
      }
    }
  };

  const solutionsChildVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      y: isMobile ? 0 : 30,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const supportLeftVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
        when: "beforeChildren",
        staggerChildren: isMobile ? 0 : 0.15
      }
    }
  };

  const supportRightVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay: isMobile ? 0 : 0.2
      }
    }
  };

  const supportFeatureVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.4
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: "easeOut"
      }
    }
  };

  // Helper function for solution block animations
  const solutionBlockTextVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      x: 0
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const solutionBlockImageVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      scale: 1
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  return (
    <div ref={containerRef} className="relative bg-[#000000] min-h-screen w-full overflow-x-hidden">

      {/* ==================== SOLUTIONS SECTION ==================== */}
      <section
        ref={solutionsRef}
        className="relative w-full pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-20 sm:pb-36 md:pb-44 lg:pb-56 px-4 sm:px-6 md:px-10 lg:px-12 overflow-x-hidden"
        style={{
          backgroundImage: "url('/live-background/randomBg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* GOLD + BLACK FADE LAYERS */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              /* STRONGER TOP BLACK FADE */
              linear-gradient(
                to bottom,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.95) 6%,
                rgba(0,0,0,0.85) 12%,
                rgba(0,0,0,0.65) 18%,
                rgba(0,0,0,0.4) 25%,
                rgba(0,0,0,0.15) 32%,
                rgba(0,0,0,0) 40%
              ),

              /* GOLD OVERLAY */
              linear-gradient(
                to bottom,
                rgba(253,204,0,0.35) 0%,
                rgba(253,204,0,0.25) 15%,
                rgba(253,204,0,0.15) 35%,
                rgba(253,204,0,0.08) 55%,
                rgba(253,204,0,0.03) 75%,
                rgba(253,204,0,0) 100%
              ),

              /* BOTTOM BLACK FADE */
              linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 78%,
                rgba(0,0,0,0) 100%
              )
            `,
          }}
        />

        <motion.div
          initial="hidden"
          animate={solutionsControls}
          variants={solutionsVariants}
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center mb-20 w-full"
        >
          {/* Badge */}
          <motion.div
            variants={solutionsChildVariants}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FDCC00]/20 to-[#FFD700]/10 backdrop-blur-md border border-[#FDCC00]/30 px-5 py-2 rounded-full mb-6 bee-body-sm text-[var(--beesee-gold)] uppercase tracking-[0.18em]"
          >
            <Layers size={18} className="text-[#FDCC00]" />
            Enterprise Solutions Portfolio
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={solutionsChildVariants}
            className="bee-title-lg text-[var(--beesee-gold)] tracking-wide"
          >
            COMPLETE INFRASTRUCTURE SOLUTIONS
          </motion.h2>

          {/* Paragraph */}
          <motion.p
            variants={solutionsChildVariants}
            className="bee-body max-w-3xl mx-auto mt-6 leading-relaxed"
          >
            From high-performance servers to comprehensive cloud infrastructure, our enterprise solutions are designed to scale with your business needs while maintaining the highest standards of reliability and security.
          </motion.p>
        </motion.div>

        {/* SOLUTION BLOCKS */}
        <motion.div 
          initial="hidden"
          animate={solutionsControls}
          variants={solutionsVariants}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-28 w-full"
        >
          {solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon] || Network;

            return (
              <motion.div 
                key={solution.id}
                variants={solutionsChildVariants}
                className={`grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center w-full ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* TEXT SIDE */}
                <motion.div
                  initial="hidden"
                  whileInView={isMobile ? "visible" : "visible"}
                  viewport={{ once: true, amount: 0.2 }}
                  variants={solutionBlockTextVariants}
                  className={`space-y-6 sm:space-y-8 w-full ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="flex items-center gap-3 sm:gap-5">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg sm:rounded-xl border border-[#FDCC00]/35 flex items-center justify-center bg-[#FDCC00]/10 flex-shrink-0">
                      <IconComponent size={20} className="sm:w-6 sm:h-6 text-[var(--beesee-gold)]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--beesee-gold)] line-clamp-2">{solution.title}</h3>
                  </div>

                  <p className="text-sm sm:text-base md:text-lg leading-relaxed md:leading-[1.8] max-w-xl text-white/85">{solution.description}</p>

                  <div className="space-y-3 w-full">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white">Key Features</h4>
                    <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                      {solution.features.map((feature, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2 sm:gap-3"
                        >
                          <CheckCircle size={16} className="sm:w-5 sm:h-5 text-[var(--beesee-gold)] mt-0.5 sm:mt-1 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base text-white/70">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl border border-[#FDCC00]/25 p-4 sm:p-6 w-full">
                    <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white mb-3 sm:mb-4">Technical Specifications</h4>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-5 w-full">
                      {Object.entries(solution.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-xs sm:text-sm opacity-70 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="text-sm sm:text-base md:text-lg text-white font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* IMAGE SIDE */}
                <motion.div
                  initial="hidden"
                  whileInView={isMobile ? "visible" : "visible"}
                  viewport={{ once: true, amount: 0.2 }}
                  variants={solutionBlockImageVariants}
                  className={`w-full ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <div className="relative backdrop-blur-md rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-[#FDCC00]/25 w-full">
                    <img 
                      src={solution.image_url} 
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg sm:rounded-xl" 
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
      <section
        ref={supportRef}
        className="relative w-full py-12 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#000000] overflow-x-hidden"
      >
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FDCC00]/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD700]/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <motion.div 
            ref={supportLeftRef}
            initial="hidden"
            animate={supportLeftControls}
            variants={supportLeftVariants}
            className="w-full"
          >
            <div
              style={{ fontFamily: "Georgia, serif" }}
              className="text-[#FDCC00]/80 text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4"
            >
              We're Here for You
            </div>

            <h2
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#FDCC00] tracking-wide leading-tight mb-4 sm:mb-6"
            >
              INTEGRATED SUPPORT & SERVICES
            </h2>

            <p
              className="text-sm sm:text-base md:text-lg mb-6 sm:mb-9 max-w-xl text-white/85"
            >
              Get the help you need, anytime, anywhere. BeeSee ensures you stay connected and supported because we believe great technology deserves great care.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4 sm:space-y-5 w-full">
              {supportFeatures.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative flex items-start gap-3 sm:gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-[#FDCC00]/20 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:border-[#FDCC00]/50 hover:shadow-xl hover:shadow-[#FDCC00]/20 hover:-translate-y-1 transition-all duration-300 w-full"
                  >
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#FDCC00]/5 via-transparent to-[#FFD700]/5 pointer-events-none"></div>

                    <div className="relative p-2 sm:p-3 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10 rounded-full border border-[#FDCC00]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                      <IconComponent className="w-5 sm:w-6 h-5 sm:h-6 text-[#FDCC00]" />
                      <div className="absolute inset-0 rounded-full bg-[#FDCC00]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>

                    <div className="flex-1">
                      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-base sm:text-lg md:text-xl text-white mb-0.5 sm:mb-1 group-hover:text-[#FDCC00] transition-colors duration-300 tracking-wide">
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: "Segoe UI, sans-serif" }} className="text-xs sm:text-sm md:text-base text-[#C7B897]/80 leading-relaxed group-hover:text-[#C7B897]/100 transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Image */}
          <div
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedPage;