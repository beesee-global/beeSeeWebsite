import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
    scrollYProgress: any;
}

const Hero: React.FC<HeroProps> = ({ scrollYProgress }) => {
    return (
        <section className="scroll-section relative min-h-dvh flex items-center justify-center overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28">
            {/* BACKGROUND VIDEO */}
            <div className="absolute inset-0 z-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/live-background/coverVideo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#000000]" style={{ opacity: 0.84 }}></div>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top, rgba(253, 204, 0, 0.16), transparent 55%)' }}></div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 text-center text-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center">
                    {/* LOGO */}
                    <motion.img
                        src="/beeSeeGold.png"
                        alt="BeeSee Logo"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-[170px] sm:w-[220px] md:w-[320px] lg:w-[360px] mb-4 md:mb-6 select-none"
                    />

                    {/* TITLE */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                        }}
                        className="font-normal leading-[0.9] text-center text-[#FDCC00] tracking-[0.08em] whitespace-nowrap text-[46px] sm:text-[64px] md:text-[84px] lg:text-[104px] max-sm:whitespace-normal max-sm:flex max-sm:flex-col max-sm:space-y-1"
                    >
                        <span className="max-sm:text-[44px] max-sm:leading-[0.95]">INNOVATION</span> <span className="max-sm:text-[36px] max-sm:leading-[0.95]">BEGINS WITH US</span>
                    </motion.h1>

                    {/* SUBTITLE */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            fontFamily: 'Georgia, serif',
                        }}
                        className="text-[#FDCC00]/80 uppercase mx-auto mt-3 md:mt-4 mb-2 text-sm sm:text-base md:text-lg tracking-[0.24em] max-sm:text-[11px] max-sm:tracking-[0.16em] max-sm:whitespace-nowrap overflow-hidden"
                    >
                        Envision. Connect. Inspire.
                    </motion.h2>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;