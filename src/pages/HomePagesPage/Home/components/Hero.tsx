import React from "react";
import { motion, useTransform } from "framer-motion";

interface HeroProps {
  scrollYProgress: any;
}

const Hero: React.FC<HeroProps> = ({ scrollYProgress }) => {
// EXTREME PARALLAX — HIGH VISIBILITY
const logoY = useTransform(scrollYProgress, [0, 1], ["0vh", "-35vh"]);
const logoOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

const titleY = useTransform(scrollYProgress, [0, 1], ["0vh", "-50vh"]);
const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
const titleOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);

const subtitleY = useTransform(scrollYProgress, [0, 1], ["0vh", "-65vh"]);
const subtitleOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);


  return (
    <section className="scroll-section relative h-screen flex items-center justify-center overflow-hidden">
      {/* BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/live-background/coverVideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#000000] opacity-85"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* LOGO */}
          <motion.img
            src="/assets/images/BEESEE.png"
            alt="BeeSee Logo"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              y: logoY,
              opacity: logoOpacity,
            }}
            className="
              w-[200px] 
              sm:w-[200px] 
              md:w-[450px] 
              lg:w-[450px]
              xl:w-[450px]
              mb-2
              mr-2.5
              select-none
            "
          />

          {/* TITLE */}
          <motion.h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              y: titleY,
              scale: titleScale,
              opacity: titleOpacity,
            }}
            className="
              font-normal leading-none text-center text-[#FDCC00] tracking-wide
              whitespace-nowrap
              text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px]
              max-sm:whitespace-normal max-sm:flex max-sm:flex-col max-sm:space-y-1
            "
          >
            <span className="max-sm:text-[60px] max-sm:leading-[0.9]">
              INNOVATION
            </span>{" "}
            <span className="max-sm:text-[45px] max-sm:leading-[0.9]">
              BEGINS WITH US
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.h2
            style={{
              fontFamily: "Georgia, serif",
              y: subtitleY,
              opacity: subtitleOpacity,
            }}
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
            Envision. Connect. Inspire.
          </motion.h2>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
