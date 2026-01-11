import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ictPicture = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80";
const digitalContent = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80";
const revolunizing = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80";
const program = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80";

const steps = [
  { 
    id: 1, 
    title: "Differentiated Activities through ICT", 
    short: "ICT-driven activities tailored to different learning styles",
    description: "Interactive tools and digital platforms enable teachers to address diverse learning styles—visual, auditory, and kinesthetic—within one unified ecosystem.",
    image: ictPicture,
  },
  { 
    id: 2, 
    title: "Digital Content", 
    short: "Curriculum-aligned media ready to deploy",
    description: "High-quality digital lessons, assessments, and simulations designed to integrate seamlessly into existing academic structures.",
    image: digitalContent,
  },
  { 
    id: 3, 
    title: "Revolutionizing Curriculum", 
    short: "Aligning subjects with emerging industries",
    description: "Modernizing education by embedding 21st-century skills, STEM disciplines, and industry-aligned tools without disrupting core academic foundations.",
    image: revolunizing,
  },
  { 
    id: 4, 
    title: "Professional Development Program", 
    short: "Equipping teachers with future-ready skills",
    description: "Sustained teacher and leadership training through structured coaching, certification, and long-term innovation support.",
    image: program,
  },
];

const StepperSectionDesktop = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 🔹 Page entrance/exit variants
  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.5, ease: "easeIn" } },
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + steps.length) % steps.length);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % steps.length);
    setIsAutoPlay(false);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="stepper-page"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="relative bg-[#000000] min-h-screen">
          {/* GLOBAL BACKGROUND VIDEO */}
          <div className="fixed inset-0 z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/live-background/sectionThree.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[#000000]/75" />
          </div>

          <section className="relative z-10 flex flex-col justify-center min-h-screen py-16 md:py-24 px-4 md:px-8 lg:px-12">
            <div className="max-w-[1200px] mx-auto w-full">
             
              <div className="text-center mb-12 md:mb-20 px-4">
                <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1] mb-6">
                  SCHOOL PROCESS
                </h2>
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--beesee-gold)]/20 to-transparent"></div>
                  </div>
                  <p className="bee-body relative px-8 bg-[#000000] inline-block text-[#C7B897]/90 leading-relaxed text-base md:text-lg">
                    A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
                  </p>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--beesee-gold)]/20 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Carousel Container */}
              <div className="relative">
                {/* Navigation Arrows */}
                <button
                  onClick={handlePrev}
                  className="absolute -left-2 md:-left-4 lg:-left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[var(--beesee-gold)] to-yellow-500 flex items-center justify-center shadow-xl shadow-[var(--beesee-gold)]/40 text-black hover:shadow-[var(--beesee-gold)]/60 hover:scale-105 active:scale-95 transition-all z-40 border-3 border-black/20"
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 stroke-[2.5]" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute -right-2 md:-right-4 lg:-right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[var(--beesee-gold)] to-yellow-500 flex items-center justify-center shadow-xl shadow-[var(--beesee-gold)]/40 text-black hover:shadow-[var(--beesee-gold)]/60 hover:scale-105 active:scale-95 transition-all z-40 border-3 border-black/20"
                >
                  <ChevronRight className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 stroke-[2.5]" />
                </button>

                {/* Main Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="beesee-card-content bg-[#0A0A0A]/60 border-2 border-[var(--beesee-gold)]/30 rounded-[28px] backdrop-blur-2xl shadow-[0_20px_60px_rgba(253,204,0,0.2)] overflow-hidden mx-2">
                      <div className="grid lg:grid-cols-2 gap-0">
                        {/* Left Content */}
                        <div className="relative p-8 md:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-gradient-to-br from-[#000000]/40 to-transparent">
                          <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-4 leading-[1.15] tracking-tight text-lg md:text-xl">
                            {steps[activeIndex].title}
                          </h3>
                          <p 
                            className="text-[#C7B897] italic mb-6 text-[15px] md:text-[16px] leading-[1.6]"
                            style={{ fontFamily: 'Georgia, serif' }}
                          >
                            {steps[activeIndex].short}
                          </p>
                          <p className="bee-body text-[#C7B897]/95 leading-[1.7] text-[14px] md:text-[15px]">
                            {steps[activeIndex].description}
                          </p>
                        </div>

                        {/* Right Image */}
                        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden group">
                          <img
                            src={steps[activeIndex].image}
                            alt={steps[activeIndex].title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-from-[#000000]/30 to-transparent opacity-60" />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/60 via-transparent to-transparent" />
                          <div className="absolute top-6 right-6 md:top-8 md:right-8">
                            <div className="relative">
                              <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--beesee-gold)] blur-xl opacity-40" />
                              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--beesee-gold)] via-yellow-500 to-yellow-600 shadow-2xl border-[4px] border-white/20">
                                <span className="text-3xl md:text-4xl font-black text-black">
                                  {steps[activeIndex].id}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#000000]/90 via-[#000000]/60 to-transparent">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="bee-body-sm text-[var(--beesee-gold)] font-semibold mb-1 text-sm md:text-base">
                                  {steps[activeIndex].title}
                                </p>
                                <p className="text-xs text-[#C7B897]/70 uppercase tracking-wider text-start">
                                  Process Step {steps[activeIndex].id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div className="mt-8 md:mt-12 space-y-6">
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveIndex(index);
                        setIsAutoPlay(false);
                      }}
                      className="group relative"
                    >
                      {index === activeIndex && (
                        <div className="absolute inset-0 w-8 h-8 -translate-x-1/4 -translate-y-1/4 rounded-full bg-[var(--beesee-gold)] blur-lg opacity-30" />
                      )}
                      <div className={`relative w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                        index === activeIndex
                          ? "bg-[var(--beesee-gold)] scale-125 shadow-lg shadow-[var(--beesee-gold)]/40"
                          : "bg-[var(--beesee-gold)]/20 group-hover:bg-[var(--beesee-gold)]/40 group-hover:scale-110 border border-[var(--beesee-gold)]/30"
                      }`} />
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="bee-body text-[#C7B897] text-base md:text-lg">
                    <span className="text-[var(--beesee-gold)] font-bold text-xl md:text-2xl">{activeIndex + 1}</span>
                    <span className="text-[#C7B897]/50 mx-2 md:mx-3">/</span>
                    <span className="text-[#C7B897]/80 font-medium">{steps.length}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Gradient */}
          <div className="pointer-events-none fixed bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#000] z-[1]" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StepperSectionDesktop;
