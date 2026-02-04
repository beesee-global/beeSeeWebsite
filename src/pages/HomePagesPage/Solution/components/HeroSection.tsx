"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CircuitBoard,
  BatteryCharging,
  Laptop,
  Watch,
  BookOpen,
  ChartNoAxesCombined
} from "lucide-react";

const services = [
  {
    title: "System Development",
    description:
      "Custom-built software solutions designed to streamline operations, automate workflows, and support scalable business growth.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Innovative Devices",
    description:
      "Cutting-edge hardware solutions engineered to enhance productivity, performance, and modern digital experiences.",
    icon: Laptop,
  },
  {
    title: "Network Solutions",
    description:
      "Reliable and secure network infrastructures that ensure seamless connectivity, data protection, and system efficiency.",
    icon: CircuitBoard,
  },
  {
    title: "School Process",
    description:
      "Digital systems that simplify enrollment, grading, records management, and administrative workflows for schools and universities.",
    icon: BookOpen,
  },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* -------------------------------
     Scroll-based motion (Desktop only)
  -------------------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  /* -------------------------------
     Intersection fade-in (Desktop only)
  -------------------------------- */
  useEffect(() => {
    if (isMobile) {
      setIsVisible(true); // Always visible on mobile
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [isMobile]);

  // Helper to conditionally wrap with motion.div
  const MotionWrapper = ({ 
    children, 
    style, 
    initial, 
    animate, 
    transition,
    className = "" 
  }: any) => {
    if (isMobile) {
      return <div className={className}>{children}</div>;
    }
    
    return (
      <motion.div
        className={className}
        style={style}
        initial={initial}
        animate={animate}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  };

  // Helper for service cards
  const ServiceCardWrapper = ({ 
    children, 
    index,
    className = "" 
  }: any) => {
    if (isMobile) {
      return <div className={className}>{children}</div>;
    }
    
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 80 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 1,
          delay: 0.4 + index * 0.15,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-screen flex items-center justify-center py-12 sm:py-16 md:py-20 lg:py-28 px-3 sm:px-4"
    >
      {/* ================= BACKGROUND ================= */}
      <MotionWrapper
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ y: isMobile ? 0 : bgY }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/live-background/holo4.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#000000] opacity-70" />
      </MotionWrapper>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">

        {/* HEADER */}
        <MotionWrapper
          className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
          style={{ y: isMobile ? 0 : headerY }}
          initial={{ opacity: 0, y: 60 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >


          <h2 className="bee-title-lg text-[#FDCC00] mb-4 sm:mb-5">
            SERVICES WE OFFER
          </h2>

          <p className="bee-body-lg text-[#C7B897]/90 leading-relaxed max-w-3xl mx-auto mt-3 sm:mt-4 md:mt-5 lg:mt-6 px-3 sm:px-4 md:px-6">
            Discover a complete suite of modern solutions designed to support
            your workflow, enhance productivity, and empower your digital
            experience.
          </p>
        </MotionWrapper>

        {/* SERVICES GRID */}
        <MotionWrapper
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
          style={{ y: isMobile ? 0 : cardY }}
        >
          {services.map((service, index) => {
            const IconComponent = service.icon;

            return (
              <ServiceCardWrapper
                key={index}
                index={index}
                className="group relative px-1 sm:px-0"
              >
                <div
                  className={`
                    relative h-full 
                    bg-gradient-to-br from-white/10 to-white/5
                    backdrop-blur-md 
                    border border-[#FDCC00]/20
                    rounded-xl sm:rounded-2xl
                    p-4 sm:p-5 md:p-6 lg:p-8
                    shadow-lg shadow-black/20
                    ${isMobile ? '' : 'hover:shadow-2xl hover:shadow-[#FDCC00]/30 transition-all duration-500 hover:border-[#FDCC00]/50 hover:-translate-y-2'}
                    flex flex-col items-center text-center 
                    min-h-[280px] xs:min-h-[300px] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[360px]
                  `}
                >
                  {!isMobile && (
                    <div className="
                      absolute inset-0 rounded-2xl opacity-0
                      group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-br from-[#FDCC00]/10 via-transparent to-[#FFD700]/10
                    " />
                  )}

                  {/* Icon */}
                  <div
                    className={`
                      relative mb-4 sm:mb-5 md:mb-6 lg:mb-8
                      p-3 sm:p-4 
                      rounded-full
                      bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10
                      border-2 border-[#FDCC00]/30
                      ${isMobile ? '' : 'group-hover:scale-110 group-hover:rotate-6 transition-all duration-500'}
                    `}
                  >
                    <IconComponent className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FDCC00]" />
                  </div>

                  {/* Title */}
                  <h3 className={`bee-title-sm text-white mb-2 sm:mb-3 md:mb-4 ${isMobile ? '' : 'group-hover:text-[#FDCC00] transition-colors duration-300'} px-1`}>
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className={`bee-body-sm text-[#C7B897]/80 leading-relaxed ${isMobile ? '' : 'group-hover:text-[#C7B897]/100 transition-colors duration-300'} flex-grow px-1 sm:px-0`}>
                    {service.description}
                  </p>
                </div>
              </ServiceCardWrapper>
            );
          })}
        </MotionWrapper>
      </div>
    </section>
  );
};

export default HeroSection;