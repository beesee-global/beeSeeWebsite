import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    // Mock images for the film roll effect
    const images = [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=300&fit=crop',
    ];

    // Create multiple rows with duplicated images for seamless loop
    const rows = [
        [...images, ...images, ...images],
        [...images, ...images, ...images],
        [...images, ...images, ...images],
    ];

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* FILM ROLL BACKGROUND */}
            <div className="absolute inset-0 z-0 opacity-40 -rotate-[8deg] scale-110">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex overflow-hidden py-4">
                        <motion.div
                            className="flex gap-8"
                            animate={{
                                x: rowIndex % 2 === 0 ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
                            }}
                            transition={{
                                duration: 50,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {row.map((img, imgIndex) => (
                                <div
                                    key={imgIndex}
                                    className="flex-shrink-0 w-[600px] h-[400px] bg-gray-900 rounded-2xl overflow-hidden border-[8px] border-yellow-500/50 shadow-2xl"
                                >
                                    <img
                                        src={img}
                                        alt={`Film ${imgIndex}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* DARK OVERLAY 
            <div className="absolute inset-0 bg-black/70 z-[1]"></div> /*}

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
                        transition={{ duration: 0.8, delay: 0.2 }}
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