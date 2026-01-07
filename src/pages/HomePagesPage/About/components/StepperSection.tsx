import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

// Mock images 
const ictPictue = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80";
const digitalContent = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80";
const revolunizing = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80";
const program = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80";

const steps = [
  { 
    id: 1, 
    title: "Differentiated Activities through ICT", 
    description: "Interactive tools and digital platforms enable teachers to address diverse learning styles—visual, auditory, and kinesthetic—within one unified ecosystem.",
    image: ictPictue 
  },
  { 
    id: 2, 
    title: "Digital Content", 
    description: "Curriculum-aligned digital lessons, assessments, and simulations designed to integrate seamlessly into existing academic structures.",
    image: digitalContent 
  },
  { 
    id: 3, 
    title: "Revolutionizing Curriculum", 
    description: "Modernizing education by embedding 21st-century skills, STEM disciplines, and industry-aligned tools without disrupting core academic foundations.",
    image: revolunizing 
  },
  { 
    id: 4, 
    title: "Professional Development Program", 
    description: "Sustained teacher and leadership training through structured coaching, certification, and long-term innovation support.",
    image: program 
  },
];

// Mobile Step Card Component
const MobileStepCard: React.FC<{ step: typeof steps[0], index: number }> = ({ step, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-lg w-full">
        <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--beesee-gold)]/30 bg-black/40 backdrop-blur-sm shadow-[0_0_30px_rgba(253,204,0,0.1)]">
          {/* Image */}
          <div className="relative h-64">
            <img 
              src={step.image}
              alt={step.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Step Number Badge */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-[var(--beesee-gold)] flex items-center justify-center border-4 border-black/30 shadow-lg">
              <span className="text-2xl font-bold text-black">{step.id}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-[var(--beesee-gold)] text-xs tracking-widest mb-2 font-semibold">
                STEP {step.id} / {steps.length}
              </p>
              <h3 className="bee-title-sm text-[var(--beesee-gold)] text-xl leading-tight">
                {step.title}
              </h3>
            </div>
            <p className="bee-body text-[#C7B897]/90 text-sm leading-relaxed">
              {step.description}
            </p>

            {/* Progress Bar */}
            <div className="flex gap-2 pt-2">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "flex-1 bg-[var(--beesee-gold)]" : "w-8 bg-[var(--beesee-gold)]/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StepperSection: React.FC = () => {
  const processRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if section is in view to show/hide indicators
  const sectionInView = useInView(processRef, { 
    once: false, 
    amount: 0.1 
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll progress for the entire section
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start start", "end end"],
  });

  // MOBILE VIEW - Simple Card Stack
  if (isMobile) {
    return (
      <section ref={processRef} className="relative bg-[#000000] py-8">
        {steps.map((step, index) => (
          <MobileStepCard key={step.id} step={step} index={index} />
        ))}
      </section>
    );
  }

  // DESKTOP VIEW - Sticky Parallax
  return (
    <section
      ref={processRef}
      className="relative h-[400vh] bg-[#000000]"
    >
      {/* STEP INDICATOR - Only show when section is in view */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: sectionInView ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-4"
      >
        {steps.map((step, i) => {
          const start = i / steps.length;
          const end = (i + 1) / steps.length;

          const scale = useTransform(
            scrollYProgress,
            [start, end],
            [1.2, 0.8]
          );

          const opacity = useTransform(
            scrollYProgress,
            [start, end],
            [1, 0.4]
          );

          return (
            <motion.div
              key={step.id}
              style={{ scale, opacity }}
              className="w-3 h-3 rounded-full bg-[var(--beesee-gold)] shadow-[0_0_10px_rgba(253,204,0,0.5)]"
            />
          );
        })}
      </motion.div>

      {/* STICKY VIEWPORT - All steps render here with opacity transitions */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {steps.map((step, i) => {
          const start = i / steps.length;
          const end = (i + 1) / steps.length;

          // Opacity fade in/out for smooth transitions
          const opacity = useTransform(
            scrollYProgress,
            [start, start + 0.1, end - 0.1, end],
            [0, 1, 1, 0]
          );

          // Background image parallax (slower movement)
          const bgY = useTransform(
            scrollYProgress,
            [start, end],
            ["0%", "-15%"]
          );

          // Content parallax (faster movement)
          const contentY = useTransform(
            scrollYProgress,
            [start, end],
            ["30%", "-20%"]
          );

          return (
            <motion.div
              key={step.id}
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* BACKGROUND IMAGE with parallax */}
              <motion.img
                src={step.image}
                loading="lazy"
                style={{ y: bgY }}
                className="absolute inset-0 w-full h-full object-cover"
                alt={step.title}
              />
              <div className="absolute inset-0 bg-black/70" />

              {/* CONTENT with parallax */}
              <motion.div
                style={{ y: contentY }}
                className="relative z-10 max-w-4xl px-6 text-center"
              >
                <p className="text-[var(--beesee-gold)] text-sm tracking-widest mb-3 font-semibold">
                  STEP {step.id} / {steps.length}
                </p>
                <h2 className="bee-title-md text-[var(--beesee-gold)] mb-4">
                  {step.title}
                </h2>
                <p className="bee-body text-[#C7B897]/90 max-w-2xl mx-auto leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* GRADIENT FADE at bottom */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#000] z-10" />
    </section>
  );
};

export default StepperSection;