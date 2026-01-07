import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Heart, Target } from "lucide-react";

// Mock images 
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
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs for view detection
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  
  // Track if sections are in view
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const storyInView = useInView(storyRef, { once: false, amount: 0.3 });
  const stepperInView = useInView(stepperRef, { once: false, amount: 0.3 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentStep = steps[activeStep];

  // PPT-style animation variants (clean slide in/out)
  const slideInLeft = {
    hidden: { x: -100, opacity: 1 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      x: -100, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const slideInRight = {
    hidden: { x: 100, opacity: 1 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      x: 100, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  // Company Story animation (reversed - pababa)
  const slideInDown = {
    hidden: { y: -50, opacity: 1 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      y: 50, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  // For mission/vision cards with staggered delay
  const slideInCard = {
    hidden: { y: -30, opacity: 1 },
    visible: (custom: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut",
        delay: custom * 0.1 
      }
    }),
    exit: { 
      y: 30, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  // Helper function to determine animation based on view state
  const getAnimationState = (inView: boolean) => {
    if (isMobile) return "visible";
    return inView ? "visible" : "exit";
  };

  return (
    <div ref={containerRef} className="relative bg-[#000000]">

      {/* GLOBAL BACKGROUND VIDEO */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/live-background/sectionThree.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#000000]/70" />
      </div>

      {/* HERO SECTION - MOVED HIGHER IN BOTH MOBILE AND DESKTOP */}
      <section
        ref={heroRef}
        className={`relative flex items-start z-10 px-3 sm:px-4 md:px-8 lg:px-12 ${
          isMobile ? "pt-0 min-h-[35vh]" : "min-h-[85vh] pt-50 md:pt-50"
        }`}
      >
        <div className={`max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center ${
          isMobile ? "gap-2 py-1" : "gap-10 md:gap-12 lg:gap-16 py-12 md:py-16 lg:py-20"
        }`}>

          {/* LEFT - Slides from left on desktop */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate={getAnimationState(heroInView)}
            className={`${isMobile ? "space-y-1" : "space-y-5 md:space-y-6"}`}
          >
            <h1 className="bee-title-lg text-[var(--beesee-gold)] leading-[1.05] max-w-3xl text-lg sm:text-xl md:text-4xl lg:text-5xl xl:text-6xl">
              PHILIPPINE-BORN<br />
              INNOVATION ENGINEERED<br />
              FOR THE GLOBAL STAGE
            </h1>

            <p className="bee-body max-w-xl text-[#C7B897] leading-relaxed text-[11px] sm:text-sm md:text-base lg:text-lg mt-1">
              BeeSee Global Technologies creates hardware, software, and scalable
              learning ecosystems built for Philippine environments and deployed
              to the world.
            </p>

            <div className={`flex flex-wrap items-center ${isMobile ? "gap-1 pt-0.5" : "gap-5 md:gap-6 pt-3 md:pt-4"}`}>
              <button
                onClick={() => setShowVideo(true)}
                className="beesee-button beesee-button--small flex items-center gap-1 text-[10px] sm:text-xs md:text-base lg:text-lg hover:scale-105 transition-transform duration-300 px-2 py-1 md:px-5 md:py-2.5"
              >
                WATCH OUR STORY
              </button>

              <div className="space-y-0 bee-body-sm text-[#C7B897] text-[9px] sm:text-xs md:text-sm">
                <div className="text-[var(--beesee-gold)] font-semibold">10+ Years in Innovation</div>
                <div className="text-[#C7B897]/80">ICT • STEM • Enterprise Development</div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT CARD - Slides from right on desktop */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate={getAnimationState(heroInView)}
            className={isMobile ? "mt-2" : ""}
          >
            <div className="beesee-card-content section-two-card p-1.5 sm:p-2 md:p-5 bg-[#000]/30 border border-[var(--beesee-gold)]/30 rounded md:rounded-2xl backdrop-blur-lg shadow-[0_0_15px_rgba(253,204,0,0.08)] hover:scale-105 hover:border-[#FDCC00]/60 hover:shadow-[0_0_50px_rgba(253,204,0,0.15)] transition-transform duration-300">
              <AnimatePresence mode="wait">
                {showVideo ? (
                  <div className="rounded md:rounded-xl overflow-hidden aspect-[16/9]">
                    <iframe
                      src="https://www.youtube.com/embed/ysz5S6PUM-U?autoplay=1&mute=1&modestbranding=1&rel=0"
                      allowFullScreen
                      className="w-full h-full"
                      title="BeeSee Global Technologies Story"
                    />
                  </div>
                ) : (
                  <div className="rounded md:rounded-xl overflow-hidden aspect-[16/9] relative group cursor-pointer">
                    <img
                      src={buildingBeesee}
                      alt="Building BeeSee"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                  </div>
                )}
              </AnimatePresence>

              {showVideo && (
                <button
                  onClick={() => setShowVideo(false)}
                  className="bee-body-sm text-[var(--beesee-gold)] hover:text-white transition mt-1 text-[9px] sm:text-xs"
                >
                  ✕ Close Video
                </button>
              )}
            </div>
          </motion.div>

        </div>
      </section>

      {/* COMPANY STORY SECTION - MOVED HIGHER */}
      <section 
        ref={storyRef}
        className={`relative z-10 flex flex-col items-center ${
          isMobile ? "min-h-[35vh] py- px-3" : "min-h-[75vh] py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8"
        }`}
      >
        <div className="max-w-7xl w-full">
          {/* Header slides DOWN */}
          <motion.div
            variants={slideInDown}
            initial="hidden"
            animate={getAnimationState(storyInView)}
            className="text-center mb-3 md:mb-10 lg:mb-14"
          >
            <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1] text-base sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl mb-1 md:mb-3">
              From Local Vision to Global Footprint
            </h2>
            <p className="bee-body max-w-2xl mx-auto text-[#C7B897]/90 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 leading-relaxed">
              We started as a small team solving pain points in Philippine schools.
              Today, we build devices, content, and programs trusted by institutions
              nationwide—and ready for the world.
            </p>
          </motion.div>

          <div className={`grid md:grid-cols-2 gap-3 md:gap-6 lg:gap-8`}>
            {/* Mission card slides DOWN - CENTERED IN MOBILE */}
            <motion.div
              custom={0}
              variants={slideInCard}
              initial="hidden"
              animate={getAnimationState(storyInView)}
            >
              <div className="beesee-card-content p-3 sm:p-4 md:p-6 lg:p-7 hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300 rounded md:rounded-xl">
                {/* CHANGED: Flex column and items-center for mobile */}
                <div className={`flex ${isMobile ? "flex-col items-center text-center" : "flex-row items-center gap-2"} mb-2`}>
                  <Heart className="text-[var(--beesee-gold)] w-4 h-4 md:w-5 md:h-5" />
                  <h3 className="bee-title-sm text-[var(--beesee-gold)] text-sm md:text-lg mt-1">
                    MISSION
                  </h3>
                </div>
                <p className={`bee-body text-[#C7B897]/90 text-[11px] sm:text-sm md:text-base leading-relaxed ${isMobile ? "text-center" : ""}`}>
                  To democratize advanced, human-centered technology for education and enterprise
                  — making premium solutions accessible, sustainable, and rooted in real Philippine needs.
                </p>
              </div>
            </motion.div>

            {/* Vision card slides DOWN with delay - CENTERED IN MOBILE */}
            <motion.div
              custom={1}
              variants={slideInCard}
              initial="hidden"
              animate={getAnimationState(storyInView)}
            >
              <div className="beesee-card-content p-3 sm:p-4 md:p-6 lg:p-7 hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300 rounded md:rounded-xl">
                {/* CHANGED: Flex column and items-center for mobile */}
                <div className={`flex ${isMobile ? "flex-col items-center text-center" : "flex-row items-center gap-2"} mb-2`}>
                  <Target className="text-[var(--beesee-gold)] w-4 h-4 md:w-5 md:h-5" />
                  <h3 className="bee-title-sm text-[var(--beesee-gold)] text-sm md:text-lg mt-1">
                    VISION
                  </h3>
                </div>
                <p className={`bee-body text-[#C7B897]/90 text-[11px] sm:text-sm md:text-base leading-relaxed ${isMobile ? "text-center" : ""}`}>
                  To establish Philippine-designed technologies as globally trusted — powering
                  future-ready classrooms, campuses, and workplaces across Asia and beyond.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STEPPER SECTION - MOVED HIGHER */}
      <section
        ref={stepperRef}
        className={`relative z-10 flex flex-col items-center ${
          isMobile ? "min-h-[40vh] py-8 px-3" : "min-h-[75vh] py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8"
        }`}
      >
        <div className="max-w-7xl w-full">
          {/* Header slides DOWN */}
          <motion.div
            variants={slideInDown}
            initial="hidden"
            animate={getAnimationState(stepperInView)}
            className="text-center mb-3 md:mb-10 lg:mb-14"
          >
            <h2 className="bee-title-md text-[var(--beesee-gold)] text-base sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl mb-1">
              SCHOOL PROCESS
            </h2>
            <p className="bee-body text-[#C7B897]/80 max-w-2xl mx-auto text-[11px] sm:text-sm md:text-base lg:text-lg leading-relaxed">
              A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 items-start lg:items-center gap-3 md:gap-8 lg:gap-10">
            {/* Steps list - Slides from left on desktop */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate={getAnimationState(stepperInView)}
              className="space-y-2"
            >
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                return (
                  <div 
                    key={i}
                    className="cursor-pointer flex gap-1.5 md:gap-3 items-start group p-1.5 rounded hover:bg-white/5 transition-all duration-300"
                    onClick={() => setActiveStep(i)}
                  >
                    <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center border text-[10px] md:text-sm font-bold
                      ${isActive ? "bg-[#FDCC00] text-black border-[#FDCC00]" : "border-[#9d9d9d] text-[#9d9d9d] group-hover:border-[#FDCC00] group-hover:text-[#FDCC00]"}`}>
                      {step.id}
                    </div>

                    <div className="flex-1">
                      <p className={`bee-body font-semibold text-xs md:text-sm ${isActive ? "text-[#FDCC00]" : "text-white group-hover:text-[#FDCC00]"}`}>
                        {step.title}
                      </p>
                      <p className="bee-body text-[#C7B897]/70 mt-0.5 text-[10px] md:text-sm">{step.short}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Step details - Slides from right on desktop */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate={getAnimationState(stepperInView)}
            >
              <AnimatePresence mode="wait">
                <div 
                  key={currentStep.id}
                  className="rounded md:rounded-xl overflow-hidden border border-[#FDCC00]/30 shadow-[0_0_15px_rgba(253,204,0,0.08)] bg-black/40 backdrop-blur-lg"
                >
                  <div className="relative overflow-hidden group">
                    <img 
                      src={currentStep.image}
                      alt={currentStep.title}
                      className="w-full h-36 sm:h-40 md:h-52 lg:h-60 object-cover transition-transform duration-700 group-hover:scale-[1.08]" 
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-1 left-1.5 md:bottom-2 md:left-3 text-[#FDCC00] text-[9px] md:text-sm font-semibold">
                      Step {currentStep.id} / {steps.length}
                    </div>
                  </div>

                  <div className="p-2 md:p-4 lg:p-5">
                    <h3 className="bee-title-sm text-[#FDCC00] text-sm md:text-lg">{currentStep.title}</h3>
                    <p className="bee-body text-[#C7B897]/90 mt-1 text-xs md:text-base">{currentStep.description}</p>
                  </div>
                </div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#000] z-[1]" />
    </div>
  );
};

export default UnifiedScrollingPage;