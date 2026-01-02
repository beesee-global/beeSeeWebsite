"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  BatteryCharging,
  Laptop,
  Watch,
} from "lucide-react";

const services = [
  {
    title: "System Development",
    description:
      "Custom-built software solutions designed to streamline operations, automate workflows, and support scalable business growth.",
    icon: BookOpen,
  },
  {
    title: "Innovative Devices",
    description:
      "Cutting-edge hardware solutions engineered to enhance productivity, performance, and modern digital experiences.",
    icon: BatteryCharging,
  },
  {
    title: "Network Solutions",
    description:
      "Reliable and secure network infrastructures that ensure seamless connectivity, data protection, and system efficiency.",
    icon: Laptop,
  },
  {
    title: "School Process",
    description:
      "Digital systems that simplify enrollment, grading, records management, and administrative workflows for schools and universities.",
    icon: Watch,
  },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* -------------------------------
     Scroll-based motion
  -------------------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle vertical movement layers
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  /* -------------------------------
     Intersection fade-in
  -------------------------------- */
  useEffect(() => {
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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
    >
      {/* ================= BACKGROUND ================= */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
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

        <div className="absolute inset-0 bg-[#000000] opacity-75" />
      </motion.div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">

        {/* HEADER */}
        <motion.div
          className="text-center mb-16"
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 60 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div
            style={{ fontFamily: "Georgia, serif" }}
            className="
              text-[#FDCC00]/80
              uppercase
              mx-auto
              mb-2
              text-base md:text-lg tracking-[0.3em]
              max-sm:text-[10px]
              max-sm:tracking-[0.15em]
              max-sm:whitespace-nowrap
              overflow-hidden
            "
          >
            EXCELLENCE IN EVERY SOLUTION
          </div>

          <h2
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="
              font-bebas
              text-[#FDCC00]
              leading-none
              tracking-wide
              select-none
              text-10xl sm:text-6xl md:text-7xl lg:text-8xl
              whitespace-nowrap
              max-sm:whitespace-normal max-sm:flex max-sm:flex-col max-sm:space-y-1
              max-sm:text-[70px]
            "
          >
            <span className="max-sm:leading-[0.9]">SERVICES</span>{" "}
            <span className="max-sm:leading-[0.9]">WE OFFER</span>
          </h2>

          <p
            style={{ fontFamily: "Segoe UI, sans-serif" }}
            className="
              bee-body
              leading-relaxed
              max-w-3xl mx-auto
              mt-6
            "
          >
            Discover a complete suite of modern solutions designed to support
            your workflow, enhance productivity, and empower your digital
            experience.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          style={{ y: cardY }}
        >
          {services.map((service, index) => {
            const IconComponent = service.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 80 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 1,
                  delay: 0.4 + index * 0.15,
                  ease: "easeOut",
                }}
                className="group relative"
              >
                <div
                  className="
                    relative h-full 
                    bg-gradient-to-br from-white/10 to-white/5
                    backdrop-blur-md 
                    border border-[#FDCC00]/20
                    rounded-2xl p-8 
                    shadow-lg shadow-black/20
                    hover:shadow-2xl hover:shadow-[#FDCC00]/30
                    transition-all duration-500
                    hover:border-[#FDCC00]/50
                    hover:-translate-y-2
                    flex flex-col items-center text-center min-h-[380px]
                  "
                >
                  <div className="
                    absolute inset-0 rounded-2xl opacity-0
                    group-hover:opacity-100 transition-opacity duration-500
                    bg-gradient-to-br from-[#FDCC00]/10 via-transparent to-[#FFD700]/10
                  " />

                  {/* Icon */}
                  <div
                    className="
                      relative mb-8 p-5 rounded-full
                      bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10
                      border-2 border-[#FDCC00]/30
                      group-hover:scale-110 group-hover:rotate-6
                      transition-all duration-500
                    "
                  >
                    <IconComponent className="w-12 h-12 text-[#FDCC00]" />
                  </div>

                  {/* Title */}
                  <h3
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    className="
                      text-2xl md:text-3xl 
                      tracking-wide 
                      text-white mb-4
                      group-hover:text-[#FDCC00] 
                      transition-colors duration-300
                    "
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{ fontFamily: "Segoe UI, sans-serif" }}
                    className="
                      bee-body
                      leading-relaxed 
                      group-hover:text-[#C7B897]/100 
                      transition-colors duration-300 flex-grow
                    "
                  >
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
