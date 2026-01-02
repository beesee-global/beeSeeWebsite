/* =========================================================
   UNIFIED SCROLLING PAGE - CLEAN VERSION
   Hero + Company Story (No Timeline) + Stepper
   Advanced Parallax with Original Branding
========================================================== */

import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { Heart, Target } from "lucide-react";

// Mock images - replace with your actual imports
const buildingBeesee = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";
const ictPictue = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80";
const digitalContent = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
const revolunizing = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80";
const program = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80";

const steps = [
  { 
    id: 1, 
    title: "Differentiated activities through ICT", 
    short: "ICT-driven activities tailored to different learning styles and needs.", 
    description: "Interactive tools and digital platforms help teachers reach visual, auditory, and kinesthetic learners in one ecosystem.",
    image: ictPictue 
  },
  { 
    id: 2, 
    title: "Digital Content", 
    short: "Curriculum-aligned media and modules, ready to deploy.",
    description: "High-quality digital lessons, assessments, and simulations that fit existing programs while opening space for new approaches.",
    image: digitalContent 
  },
  { 
    id: 3, 
    title: "Revolutionizing Curriculum", 
    short: "Aligning subjects with emerging skills and industries.",
    description: "We help schools integrate 21st-century competencies, STEM, and industry tools into their curriculum without losing structure.",
    image: revolunizing 
  },
  { 
    id: 4, 
    title: "Professional Development Program", 
    short: "Equipping teachers and leaders with future-ready skills.",
    description: "Structured training, coaching, and certification ensure that people behind the systems can sustain innovation long-term.",
    image: program 
  },
];

const UnifiedScrollingPage: React.FC = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Refs for each section to detect when they're in view
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const storySectionRef = useRef<HTMLDivElement | null>(null);
  const stepperSectionRef = useRef<HTMLDivElement | null>(null);
  
  // InView detection for each section
  const heroInView = useInView(heroSectionRef, { amount: 0.3 });
  const storyInView = useInView(storySectionRef, { amount: 0.3 });
  const stepperInView = useInView(stepperSectionRef, { amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Background video parallax
  const bgY = useTransform(smoothProgress, [0, 1], [0, -400]);
  const bgScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 1.2]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [0.6, 0.5, 0.4, 0.3]);

  // Section-specific parallax - TIGHTER TRANSITIONS
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 0.5, 0]);

  const storyY = useTransform(smoothProgress, [0.15, 0.6], [80, -100]);
  const storyOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.55, 0.65], [0, 1, 1, 0]);

  const stepperY = useTransform(smoothProgress, [0.5, 1], [80, -50]);
  const stepperOpacity = useTransform(smoothProgress, [0.5, 0.6, 1], [0, 1, 1]);

  const currentStep = steps[activeStep];

  return (
    <div ref={containerRef} className="relative bg-[#000000]">
      
      {/* ================= GLOBAL BACKGROUND VIDEO ================= */}
      <motion.div
        style={{ 
          y: bgY,
          scale: bgScale,
        }}
        className="fixed inset-0 z-0"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/live-background/sectionThree.mp4" type="video/mp4" />
        </video>
        <motion.div 
          className="absolute inset-0 bg-[#000000]"
          style={{ opacity: bgOpacity }}
        />
      </motion.div>

      {/* ================= HERO SECTION ================= */}
      <motion.section
        ref={heroSectionRef}
        style={{ 
          y: heroY,
          opacity: heroOpacity,
        }}
        className="relative h-screen flex items-center z-10 px-6 md:px-10 lg:px-12"
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center pt-40 pb-32">
          
          {/* LEFT */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: -50 }}
            animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              when: "beforeChildren"
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="bee-title-lg text-[var(--beesee-gold)] leading-[1.05] max-w-3xl"
            >
              PHILIPPINE-BORN INNOVATION ENGINEERED FOR THE GLOBAL STAGE.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
              className="bee-body max-w-xl text-[#C7B897] leading-relaxed"
            >
              BeeSee Global Technologies creates hardware, software, and scalable
              learning ecosystems built for Philippine environments and deployed
              to the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              exit={{ opacity: 0, y: 25 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-7 items-center"
            >
              <motion.button
                onClick={() => setShowVideo(true)}
                className="beesee-button beesee-button--small flex items-center gap-3"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(253, 204, 0, 0.5)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                WATCH OUR STORY
              </motion.button>

              <motion.div 
                className="space-y-1 bee-body-sm text-[#C7B897]"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="text-[var(--beesee-gold)] font-semibold">
                  10+ Years in Innovation
                </span>
                <br />
                ICT • STEM • Enterprise Development
              </motion.div>
            </motion.div>
          </motion.div>

          {/* RIGHT CARD */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          >
            <motion.div 
              className="beesee-card-content section-two-card p-6 bg-[#000]/30 border border-[var(--beesee-gold)]/30 rounded-2xl backdrop-blur-lg shadow-[0_0_40px_rgba(253,204,0,0.08)]"
              whileHover={{
                scale: 1.02,
                borderColor: 'rgba(253, 204, 0, 0.6)',
                boxShadow: '0 0 60px rgba(253, 204, 0, 0.15)',
              }}
            >
              <AnimatePresence mode="wait">
                {showVideo ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-xl overflow-hidden aspect-[16/9]"
                  >
                    <iframe
                      src="https://www.youtube.com/embed/ysz5S6PUM-U?autoplay=1&mute=1&modestbranding=1&rel=0"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.45 }}
                    className="rounded-xl overflow-hidden aspect-[16/9] relative group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.img
                      src={buildingBeesee}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              {showVideo && (
                <motion.button
                  onClick={() => setShowVideo(false)}
                  className="bee-body-sm text-[var(--beesee-gold)] hover:text-white transition mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✕ Close Video
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= COMPANY STORY SECTION (NO TIMELINE) ================= */}
      <motion.section
        ref={storySectionRef}
        style={{ 
          y: storyY,
          opacity: storyOpacity,
        }}
        className="relative h-screen z-10 py-20 px-6 lg:px-10 flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full">
          
          {/* ========= HEADER ========= */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 26 }}
            animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            exit={{ opacity: 0, y: 26 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1]">
              From Local Vision to Global Footprint
            </h2>
            <p className="bee-body max-w-2xl mx-auto text-[#C7B897]/90 mt-4">
              We started as a small team solving pain points in Philippine schools.
              Today, we build devices, content, and programs trusted by institutions
              nationwide—and ready for the world.
            </p>
          </motion.div>

          {/* ========= MISSION + VISION ========= */}
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div 
              className="beesee-card-content p-10 text-left"
              initial={{ opacity: 0, x: -40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ 
                scale: 1.03,
                borderColor: 'rgba(253, 204, 0, 0.4)',
                boxShadow: '0 0 40px rgba(253, 204, 0, 0.15)',
              }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Heart className="text-[var(--beesee-gold)] w-6 h-6" />
                <h3 className="bee-title-sm text-[var(--beesee-gold)]">MISSION</h3>
              </motion.div>
              <p className="bee-body text-[#C7B897]/90">
                To democratize advanced, human-centered technology for education and enterprise
                — making premium solutions accessible, sustainable, and rooted in real Philippine needs.
              </p>
            </motion.div>

            <motion.div 
              className="beesee-card-content p-10 text-left"
              initial={{ opacity: 0, x: 40 }}
              animate={storyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ 
                scale: 1.03,
                borderColor: 'rgba(253, 204, 0, 0.4)',
                boxShadow: '0 0 40px rgba(253, 204, 0, 0.15)',
              }}
            >
              <motion.div 
                className="flex items-center gap-3 mb-4"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Target className="text-[var(--beesee-gold)] w-6 h-6" />
                <h3 className="bee-title-sm text-[var(--beesee-gold)]">VISION</h3>
              </motion.div>
              <p className="bee-body text-[#C7B897]/90">
                To establish Philippine-designed technologies as globally trusted — powering
                future-ready classrooms, campuses, and workplaces across Asia and beyond.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ================= STEPPER SECTION ================= */}
      <motion.section
        ref={stepperSectionRef}
        style={{ 
          y: stepperY,
          opacity: stepperOpacity,
        }}
        className="relative h-screen z-10 py-20 px-6 lg:px-10 flex items-center"
      >
        <div className="max-w-7xl mx-auto w-full">
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            animate={stepperInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} 
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
            className="bee-title-md text-center text-[var(--beesee-gold)]"
          >
            SCHOOL PROCESS
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={stepperInView ? { opacity: 1 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="bee-body text-[#C7B897]/80 max-w-3xl mx-auto text-center mt-4 mb-12"
          >
            A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            
            {/* LEFT — Step Selector */}
            <div className="space-y-6">
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                const stepRef = useRef<HTMLDivElement | null>(null);
                const stepInView = useInView(stepRef, { amount: 0.5 });

                return (
                  <motion.div 
                    key={i}
                    ref={stepRef}
                    initial={{ opacity: 0, x: -20 }}
                    animate={stepperInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: i * 0.1,
                      when: "beforeChildren" 
                    }}
                    whileHover={{ scale: 1.03, x: 8 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="cursor-pointer flex gap-4 items-start group"
                    onClick={() => setActiveStep(i)}
                  >
                    <motion.div
                      animate={isActive ? { 
                        scale: 1.25, 
                        boxShadow: "0 0 20px #FDCC00aa" 
                      } : { scale: 1 }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center border transition
                        ${isActive 
                          ? "bg-[#FDCC00] text-black border-[#FDCC00]" 
                          : "border-[#9d9d9d] text-[#9d9d9d] group-hover:border-[#FDCC00] group-hover:text-[#FDCC00]"
                        }`}
                    >
                      {step.id}
                    </motion.div>

                    <div>
                      <p className={`bee-body font-semibold transition
                        ${isActive 
                          ? "text-[#FDCC00]" 
                          : "text-white group-hover:text-[#FDCC00]"
                        }`}>
                        {step.title}
                      </p>
                      <p className="bee-body text-xs text-[#C7B897]/70">{step.short}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT — Animated Card */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep.id}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={stepperInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
                exit={{ opacity: 0, scale: 0.94, y: -10 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-[#FDCC00]/30 shadow-[0_0_40px_rgba(253,204,0,0.08)] bg-black/40 backdrop-blur-xl"
              >
                <motion.div className="relative overflow-hidden group">
                  <motion.img 
                    src={currentStep.image} 
                    className="w-full h-64 object-cover transition duration-700 group-hover:scale-[1.08]" 
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-3 left-5 text-[#FDCC00] text-sm font-semibold">
                    Step {currentStep.id} / {steps.length}
                  </div>
                </motion.div>

                <div className="p-7">
                  <h3 className="bee-title-sm text-[#FDCC00]">{currentStep.title}</h3>
                  <p className="bee-body text-[#C7B897]/90 mt-2">{currentStep.description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Bottom fade */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#000] z-[1]" />
    </div>
  );
};

export default UnifiedScrollingPage;