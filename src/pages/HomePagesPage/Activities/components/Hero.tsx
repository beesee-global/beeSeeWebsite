// Hero.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    scrollYProgress: any;
}

const Hero: React.FC<HeroProps> = ({ scrollYProgress }) => {
    return (
        <section className="scroll-section relative h-dvh flex items-center justify-center overflow-hidden">
            {/* BACKGROUND VIDEO */}
            <div className="absolute inset-0 z-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/live-background/retro.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#000000] opacity-40"></div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >

                    {/* TITLE */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        className="font-normal leading-none text-center text-[#FDCC00] tracking-wide whitespace-nowrap text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] max-sm:whitespace-normal max-sm:flex max-sm:flex-col max-sm:space-y-1"
                    >
                        <span className="max-sm:text-[60px] max-sm:leading-[0.9]">OUR</span>{" "}
                        <span className="max-sm:text-[45px] max-sm:leading-[0.9]">MOMENTS</span>
                    </motion.h1>

                    {/* SUBTITLE */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ fontFamily: "Georgia, serif" }}
                        className="text-[#FDCC00]/80 uppercase mx-auto mb-2 text-base md:text-lg tracking-[0.3em] max-sm:text-[10px] max-sm:tracking-[0.15em] max-sm:whitespace-nowrap overflow-hidden"
                    >
                        Join our Journey!
                    </motion.h2>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;