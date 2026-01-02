"use client";

import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useAnimation, useInView } from "framer-motion";
import { BatteryCharging, Network, Layers, CheckCircle, PhoneCall, RotateCcw, Mail } from "lucide-react";
import { fetchAllSolutions } from "../../../../services/solutionsOverviewServices";
import { useQuery } from "@tanstack/react-query";

import "../../../../assets/css/Solutions.css";
import "../../../../assets/css/global.css"; // Ensure global typography applies

/* Dummy image for SupportServices */
import image from "../../../../../public/assets/images/elleAssets/1.jpg";

const UnifiedPage: React.FC = () => {
  /** ==================== SOLUTIONS SECTION ==================== */
  const solutionsRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: solutionsProgress } = useScroll({
    target: solutionsRef,
    offset: ["start end", "end start"],
  });
  const titleY_Solutions = useTransform(solutionsProgress, [0, 1], [60, -60]);
  const contentY_Solutions = useTransform(solutionsProgress, [0, 1], [40, -40]);
  const blocksY_Solutions = useTransform(solutionsProgress, [0, 1], [20, -20]);

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
  
  const { scrollYProgress: supportProgress } = useScroll({
    target: supportRef,
    offset: ["start end", "end start"],
  });
  const supportTitleY = useTransform(supportProgress, [0, 1], [40, -40]);
  const supportContentY = useTransform(supportProgress, [0, 1], [20, -20]);

  // Left side animation controls
  const supportLeftControls = useAnimation();
  const supportLeftInView = useInView(supportLeftRef, { 
    once: false, 
    amount: 0.2,
    margin: "-50px"
  });

  // Right side animation controls
  const supportRightControls = useAnimation();
  const supportRightInView = useInView(supportRightRef, { 
    once: false, 
    amount: 0.2,
    margin: "-50px"
  });

  useEffect(() => {
    if (supportLeftInView) {
      supportLeftControls.start("visible");
    } else {
      supportLeftControls.start("hidden");
    }
  }, [supportLeftInView, supportLeftControls]);

  useEffect(() => {
    if (supportRightInView) {
      supportRightControls.start("visible");
    } else {
      supportRightControls.start("hidden");
    }
  }, [supportRightInView, supportRightControls]);

  const supportFeatures = [
    { icon: PhoneCall, title: "Call Local Support", desc: "Talk directly with our local support experts." },
    { icon: RotateCcw, title: "Request a Callback", desc: "Leave a request and we'll reach out at your convenience." },
    { icon: Mail, title: "Ask-A-Question (After Hours)", desc: "Send your query anytime we'll reply by email promptly." },
  ];

  /** ==================== ANIMATION VARIANTS FOR SUPPORT SECTION ==================== */
  const supportLeftVariants = {
    hidden: { 
      opacity: 0, 
      x: -100,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    }
  };

  const supportRightVariants = {
    hidden: { 
      opacity: 0, 
      x: 100,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96],
        delay: 0.2
      }
    }
  };

  const supportFeatureVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      transition: {
        duration: 0.4
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="relative bg-[#000000] overflow-x-hidden">

      {/* ==================== SOLUTIONS SECTION ==================== */}
      <section
        ref={solutionsRef}
        className="relative pt-32 md:pt-40 lg:pt-48 pb-36 md:pb-44 lg:pb-56 px-6 md:px-10 lg:px-12 overflow-hidden"
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
              linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 5%, rgba(0,0,0,0.35) 10%, rgba(0,0,0,0) 15%, transparent 20%),
              linear-gradient(to bottom, rgba(253,204,0,0.35) 0%, rgba(253,204,0,0.25) 15%, rgba(253,204,0,0.15) 35%, rgba(253,204,0,0.08) 55%, rgba(253,204,0,0.03) 75%, rgba(253,204,0,0) 100%),
              linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 5%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.08) 78%, rgba(0,0,0,0) 100%)
            `,
          }}
        />

        {/* HEADER */}
        <motion.div style={{ y: contentY_Solutions }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center mb-20">
          <motion.div
            style={{ y: titleY_Solutions }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FDCC00]/20 to-[#FFD700]/10 backdrop-blur-md border border-[#FDCC00]/30 px-5 py-2 rounded-full mb-6 bee-body-sm text-[var(--beesee-gold)] uppercase tracking-[0.18em]"
          >
            <Layers size={18} className="text-[#FDCC00]" />
            Enterprise Solutions Portfolio
          </motion.div>

          <motion.h2
            style={{ y: titleY_Solutions }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bee-title-lg text-[var(--beesee-gold)] tracking-wide"
          >
            COMPLETE INFRASTRUCTURE SOLUTIONS
          </motion.h2>

          <motion.p
            style={{ y: contentY_Solutions }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bee-body max-w-3xl mx-auto mt-6 leading-relaxed"
          >
            From high-performance servers to comprehensive cloud infrastructure, our enterprise solutions are designed to scale with your business needs while maintaining the highest standards of reliability and security.
          </motion.p>
        </motion.div>

        {/* SOLUTION BLOCKS */}
        <motion.div style={{ y: blocksY_Solutions }} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 space-y-28">
          {solutions.map((solution, index) => {
            const IconComponent = iconMap[solution.icon] || Network;

            return (
              <motion.div key={solution.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                {/* TEXT SIDE */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 1 ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className={`space-y-8 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl border border-[#FDCC00]/35 flex items-center justify-center bg-[#FDCC00]/10">
                      <IconComponent size={26} className="text-[var(--beesee-gold)]" />
                    </div>
                    <h3 className="bee-title-md text-[var(--beesee-gold)]">{solution.title}</h3>
                  </div>

                  <p className="bee-body leading-[1.8] max-w-xl">{solution.description}</p>

                  <div className="space-y-4">
                    <h4 className="bee-title-sm text-white">Key Features</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {solution.features.map((feature, i) => (
                        <motion.div key={i} whileHover={{ x: 5 }} className="flex items-start gap-3">
                          <CheckCircle size={18} className="text-[var(--beesee-gold)] mt-1" />
                          <span className="bee-body-sm text-muted">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#FDCC00]/25 p-6">
                    <h4 className="bee-title-sm text-white mb-4">Technical Specifications</h4>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {Object.entries(solution.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="bee-body-sm opacity-70 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="bee-body text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* IMAGE SIDE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                >
                  <div className="relative backdrop-blur-md rounded-2xl p-6 border border-[#FDCC00]/25">
                    <img src={solution.image_url} className="w-full h-80 lg:h-96 object-cover rounded-xl" />
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
        className="relative py-20 md:py-32 px-6 lg:px-8 bg-[#000000] overflow-hidden"
      >
        {/* Animated Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FDCC00]/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD700]/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content - Slides IN FROM LEFT, OUT TO LEFT */}
          <motion.div 
            ref={supportLeftRef}
            style={{ y: supportContentY }}
            initial="hidden"
            animate={supportLeftControls}
            variants={supportLeftVariants}
          >
            <motion.div
              style={{ y: supportTitleY }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{ fontFamily: "Georgia, serif" }}
              className="text-[#FDCC00]/80 text-xs md:text-sm tracking-[0.3em] uppercase mb-4"
            >
              We're Here for You
            </motion.div>

            <motion.h2
              style={{ y: supportTitleY }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-4xl md:text-5xl lg:text-6xl text-[#FDCC00] tracking-wide leading-tight mb-6"
            >
              INTEGRATED SUPPORT & SERVICES
            </motion.h2>

            <motion.p
              style={{ y: supportContentY }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="bee-body mb-9 max-w-xl"
            >
              Get the help you need, anytime, anywhere. BeeSee ensures you stay connected and supported because we believe great technology deserves great care.
            </motion.p>

            {/* Feature Cards */}
            <div className="space-y-5">
              {supportFeatures.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={i}
                    variants={supportFeatureVariants}
                    className="group relative flex items-start gap-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-[#FDCC00]/20 p-5 rounded-xl hover:border-[#FDCC00]/50 hover:shadow-xl hover:shadow-[#FDCC00]/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#FDCC00]/5 via-transparent to-[#FFD700]/5 pointer-events-none"></div>

                    <div className="relative p-3 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10 rounded-full border border-[#FDCC00]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-[#FDCC00]" />
                      <div className="absolute inset-0 rounded-full bg-[#FDCC00]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </div>

                    <div className="flex-1">
                      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-lg md:text-xl text-white mb-1 group-hover:text-[#FDCC00] transition-colors duration-300 tracking-wide">
                        {item.title}
                      </h3>
                      <p style={{ fontFamily: "Segoe UI, sans-serif" }} className="text-sm md:text-base text-[#C7B897]/80 leading-relaxed group-hover:text-[#C7B897]/100 transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Image - Slides IN FROM RIGHT, OUT TO RIGHT */}
          <motion.div
            ref={supportRightRef}
            initial="hidden"
            animate={supportRightControls}
            variants={supportRightVariants}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500 scale-105"></div>
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#FDCC00]/30 shadow-2xl shadow-[#FDCC00]/20 group-hover:border-[#FDCC00]/50 transition-all duration-500 group-hover:scale-[1.02]">
                <img src={image} alt="Customer Support" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent pointer-events-none"></div>
              </div>
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 rounded-tl-2xl transition-all duration-500"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 rounded-br-2xl transition-all duration-500"></div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedPage;