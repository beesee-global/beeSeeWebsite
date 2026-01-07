import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";

// Mock images
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
    image: ictPicture 
  },
  { 
    id: 2, 
    title: "Digital Content", 
    short: "Curriculum-aligned media ready to deploy",
    description: "High-quality digital lessons, assessments, and simulations designed to integrate seamlessly into existing academic structures.",
    image: digitalContent 
  },
  { 
    id: 3, 
    title: "Revolutionizing Curriculum", 
    short: "Aligning subjects with emerging industries",
    description: "Modernizing education by embedding 21st-century skills, STEM disciplines, and industry-aligned tools without disrupting core academic foundations.",
    image: revolunizing 
  },
  { 
    id: 4, 
    title: "Professional Development Program", 
    short: "Equipping teachers with future-ready skills",
    description: "Sustained teacher and leadership training through structured coaching, certification, and long-term innovation support.",
    image: program 
  },
];

const StepperSectionDesktop = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Track if section is in view
  const sectionInView = useInView(sectionRef, { 
    once: false, 
    amount: 0.1,
    margin: "-50px 0px"
  });

  // COMPLETE RESET on mount
  useEffect(() => {
    // Reset states
    setActiveStep(0);
    setIsScrolling(false);
    
    // Reset container scroll
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    
    // Mark as initialized after a short delay
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Clean up observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      // Clear refs
      stepRefs.current = [];
    };
  }, []);

  // Set up Intersection Observer only when initialized and in view
  useEffect(() => {
    if (!isInitialized || !sectionInView || isScrolling) return;
    
    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrolling) return;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      { 
        threshold: 0.6, 
        rootMargin: "-20% 0px -20% 0px",
        root: containerRef.current 
      }
    );
    
    // Observe all steps
    stepRefs.current.forEach(ref => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isInitialized, sectionInView, isScrolling]);

  const handleStepClick = (index: number) => {
    if (isScrolling || index === activeStep) return;
    
    setIsScrolling(true);
    setActiveStep(index);
    
    const targetElement = stepRefs.current[index];
    if (targetElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = targetElement.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top - 150;
      
      containerRef.current.scrollTo({
        top: containerRef.current.scrollTop + offset,
        behavior: "smooth"
      });
    }
    
    setTimeout(() => setIsScrolling(false), 800);
  };

  // Animation variants
  const sectionAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren"
      }
    }
  };

  const childAnimation = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      variants={sectionAnimation}
      initial="hidden"
      animate={sectionInView ? "visible" : "hidden"}
      className="relative z-10 flex flex-col items-center py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-7xl w-full">
        {/* Header */}
        <motion.div
          variants={childAnimation}
          className="text-center mb-10 md:mb-14 lg:mb-16"
        >
          <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1] text-base sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl mb-1 md:mb-3">
            SCHOOL PROCESS
          </h2>
          <p className="bee-body max-w-2xl mx-auto text-[#C7B897]/90 text-[11px] sm:text-sm md:text-base lg:text-lg mt-1 md:mt-2 leading-relaxed">
            A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
          {/* Left Panel - Steps Navigation */}
          <motion.div
            variants={childAnimation}
            className="lg:col-span-4"
          >
            <div className="sticky top-32">
              {/* Process Overview Card */}
              <div className="beesee-card-content p-6 mb-6 hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300">
                <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-6">
                  Process Overview
                </h3>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        activeStep === index
                          ? "bg-[var(--beesee-gold)]/20 border border-[var(--beesee-gold)]/40"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          activeStep > index
                            ? "bg-green-600 text-white"
                            : activeStep === index
                            ? "bg-[var(--beesee-gold)] text-black"
                            : "bg-black/60 text-[var(--beesee-gold)] border border-[var(--beesee-gold)]/30"
                        }`}>
                          {activeStep > index ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <span className="text-lg font-bold">{step.id}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className={`bee-body font-semibold ${
                            activeStep === index ? "text-[var(--beesee-gold)]" : "text-white"
                          }`}>
                            {step.title}
                          </h4>
                          <p 
                            className="mt-1 text-[#C7B897]/50 italic"
                            style={{ 
                              fontFamily: 'Georgia, serif',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              fontStyle: 'italic'
                            }}
                          >
                          
                          </p>
                        </div>
                        {activeStep === index && (
                          <ChevronRight className="w-5 h-5 text-[var(--beesee-gold)]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Progress Bar - RETAINED */}
                <div className="mt-8 pt-6 border-t border-[var(--beesee-gold)]/20">
                  <div className="flex justify-between bee-body-sm text-[#C7B897] mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((activeStep + 1) / steps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--beesee-gold)]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Step Details - HIDDEN SCROLLBAR */}
          <motion.div
            variants={childAnimation}
            className="lg:col-span-8 relative"
          >
            <div 
              ref={containerRef} 
              className="space-y-12 md:space-y-16 overflow-y-auto max-h-[700px]"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
            >
              {/* Hide scrollbar for Chrome, Safari and Opera */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  ref={el => {
                    stepRefs.current[index] = el;
                  }}
                  className="relative"
                >
                  {/* Step Indicator Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 bottom-[-4rem] w-px bg-gradient-to-b from-[var(--beesee-gold)]/40 via-[var(--beesee-gold)]/20 to-transparent hidden lg:block" />
                  )}

                  <div className="flex gap-6 md:gap-8">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                        activeStep === index
                          ? "bg-[var(--beesee-gold)] border-black/20 text-black shadow-lg shadow-[var(--beesee-gold)]/30"
                          : "bg-black/60 border-[var(--beesee-gold)]/30 text-[var(--beesee-gold)]"
                      }`}>
                        <span className="text-2xl font-bold">{step.id}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`beesee-card-content flex-1 p-6 md:p-8 transition-all duration-300 ${
                      activeStep === index 
                        ? "border-[#FDCC00]/40 shadow-[0_0_15px_rgba(253,204,0,0.15)] transform scale-[1.02]"
                        : "hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)]"
                    }`}>
                      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-6">
                          {/* Title - Left aligned */}
                          <div className="text-left">
                            <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-3">
                              {step.title}
                            </h3>
                            <p 
                              className="text-[#C7B897]/50 italic"
                              style={{ 
                                fontFamily: 'Georgia, serif',
                                fontSize: 'clamp(16px, 1.6vw, 17px)',
                                lineHeight: '1.5',
                                fontStyle: 'italic'
                              }}
                            >
                              {step.short}
                            </p>
                          </div>
                          
                          {/* Details Section - Left aligned */}
                          <div className="text-left">
                            <h4 className="bee-body-sm font-semibold text-[var(--beesee-gold)]/80 mb-3">
                              DETAILS
                            </h4>
                            <p className="bee-body text-[#C7B897]/90 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {/* Learn More Button - Left aligned */}
                          <div className="text-left pt-4">
                            <button
                              onClick={() => handleStepClick(index)}
                              className="inline-flex items-center gap-2 bee-body-sm text-[var(--beesee-gold)] hover:text-white transition-colors group"
                            >
                              <span className="font-medium">Learn more</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>

                        {/* Image Section - Right side */}
                        <div className="beesee-card-image relative rounded-xl overflow-hidden">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-48 md:h-64 object-cover transition-transform duration-500 hover:scale-110"
                          />
                          <div className="absolute bottom-3 left-3 bee-body-sm text-[var(--beesee-gold)] font-semibold">
                            Step {step.id} of {steps.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Card */}
            <div className="mt-12">
              <div className="beesee-card-content p-6 hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bee-body-sm text-[var(--beesee-gold)] font-semibold">
                      Step {activeStep + 1} of {steps.length}
                    </div>
                    <div className="flex gap-1">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all ${
                            i === activeStep
                              ? "bg-[var(--beesee-gold)] scale-125"
                              : i < activeStep
                              ? "bg-[var(--beesee-gold)]/60"
                              : "bg-[var(--beesee-gold)]/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStepClick(Math.max(0, activeStep - 1))}
                      disabled={activeStep === 0}
                      className={`beesee-button beesee-button--small flex items-center gap-2 ${
                        activeStep === 0 ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
                      }`}
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={() => handleStepClick(Math.min(steps.length - 1, activeStep + 1))}
                      disabled={activeStep === steps.length - 1}
                      className={`beesee-button beesee-button--small flex items-center gap-2 ${
                        activeStep === steps.length - 1 ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
                      }`}
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default StepperSectionDesktop;