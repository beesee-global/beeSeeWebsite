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
                    relative h-full overflow-hidden
                    bg-[#10100f]
                    border border-[#FDCC00]/30
                    rounded-xl sm:rounded-2xl
                    p-5 sm:p-6 md:p-7 lg:p-8
                    shadow-[0_16px_32px_rgba(0,0,0,0.35)]
                    ${isMobile ? '' : 'hover:shadow-[0_22px_45px_rgba(253,204,0,0.16)] hover:border-[#FDCC00]/70 transition-all duration-500 hover:-translate-y-2'}
                    flex flex-col items-start text-left
                    min-h-[280px] xs:min-h-[300px] sm:min-h-[320px] md:min-h-[340px] lg:min-h-[360px]
                  `}
                >
                  {/* Structured editorial details */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-[#FDCC00]/55 group-hover:bg-[#FDCC00] transition-colors duration-500" />
                  <div className="absolute inset-0 opacity-35 pointer-events-none bg-[linear-gradient(rgba(253,204,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(253,204,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="absolute -right-1 -top-8 bee-title-lg text-[#FDCC00]/[0.08] select-none leading-none" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10 flex w-full items-start justify-between border-b border-[#FDCC00]/20 pb-4 sm:pb-5">
                    <span className="bee-body-sm tracking-[0.2em] text-[#FDCC00]">SERVICE {String(index + 1).padStart(2, '0')}</span>
                    <div className={`
                      flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center
                      rounded-lg border border-[#FDCC00]/45 text-[#FDCC00]
                      ${isMobile ? '' : 'group-hover:bg-[#FDCC00] group-hover:text-black group-hover:rotate-3 transition-all duration-500'}
                    `}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-grow flex-col pt-5 sm:pt-6">
                    <div className="h-px w-10 bg-[#FDCC00] mb-4 sm:mb-5 group-hover:w-16 transition-all duration-500" />

                  <div
                    className="relative"
                  >
                    <h3 className={`bee-title-sm text-white leading-tight mb-3 sm:mb-4 ${isMobile ? '' : 'group-hover:text-[#FDCC00] transition-colors duration-300'}`}>
                      {service.title}
                    </h3>

                    <p className="bee-body-sm text-[#C7B897]/85 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  </div>
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
