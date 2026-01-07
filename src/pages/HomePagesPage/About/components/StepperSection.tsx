import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const ictPictue = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80";
const digitalContent = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80";
const revolunizing = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80";
const program = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80";

const steps = [
  { 
    id: 1, 
    title: "Differentiated Activities through ICT", 
    short: "ICT-driven activities tailored to different learning styles",
    description: "Interactive tools and digital platforms enable teachers to address diverse learning styles—visual, auditory, and kinesthetic—within one unified ecosystem.",
    image: ictPictue 
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

const StepperSection = () => {
  const processRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Track active step based on scroll
  useEffect(() => {
    if (isMobile) return;
    
    const handleScroll = () => {
      const cards = document.querySelectorAll('[data-step-card]');
      let currentActive = 0;
      
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2) {
          currentActive = index;
        }
      });
      
      setActiveStep(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <section ref={processRef} className="relative bg-[#000000]">
      {/* MOBILE VIEW */}
      {isMobile ? (
        <div className="py-12 px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="bee-title-md text-[var(--beesee-gold)] text-2xl mb-3">
              SCHOOL PROCESS
            </h2>
            <p className="bee-body text-[#C7B897]/80 text-sm max-w-lg mx-auto mb-2">
              Four clear steps that guide schools from exploration to adoption
            </p>
            <p className="bee-body-sm text-[var(--beesee-gold)]/60 text-xs">
              Tap cards to flip and explore →
            </p>
          </motion.div>

          {/* Flip Cards Grid */}
          <div className="grid gap-6 max-w-md mx-auto">
            {steps.map((step, index) => {
              const isFlipped = flippedCards[step.id];
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative h-72"
                  style={{ perspective: '1000px' }}
                  onClick={() => toggleFlip(step.id)}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* FRONT */}
                    <div 
                      className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[var(--beesee-gold)]/30 shadow-[0_0_20px_rgba(253,204,0,0.1)]"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-[var(--beesee-gold)] flex items-center justify-center border-3 border-black/30 shadow-lg">
                        <span className="text-2xl font-bold text-black">{step.id}</span>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-[var(--beesee-gold)] text-xs font-semibold mb-2">
                          STEP {step.id} / {steps.length}
                        </p>
                        <h3 className="bee-title-sm text-white text-xl mb-2 leading-tight">
                          {step.title}
                        </h3>
                        <p className="bee-body-sm text-[#C7B897] text-xs">
                          Tap to learn more
                        </p>
                      </div>
                    </div>

                    {/* BACK */}
                    <div 
                      className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[var(--beesee-gold)]/30 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--beesee-gold)] flex items-center justify-center mb-4">
                        <span className="text-xl font-bold text-black">{step.id}</span>
                      </div>
                      
                      <h3 className="bee-title-sm text-[var(--beesee-gold)] text-lg mb-3 leading-tight">
                        {step.title}
                      </h3>
                      
                      <p className="bee-body text-[#C7B897]/90 text-sm leading-relaxed mb-4">
                        {step.description}
                      </p>

                      <div className="h-1 w-16 bg-[var(--beesee-gold)] rounded" />

                      <p className="bee-body-sm text-[var(--beesee-gold)]/60 text-xs mt-4">
                        Tap to flip back
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((step) => (
              <motion.div 
                key={step.id}
                initial={{ scale: 0.8, opacity: 0.3 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                className={`rounded-full transition-all duration-300 ${
                  flippedCards[step.id] 
                    ? 'w-8 h-2 bg-[var(--beesee-gold)]' 
                    : 'w-2 h-2 bg-[var(--beesee-gold)]/30'
                }`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="text-center mt-8"
          >
            <p className="bee-body-sm text-[var(--beesee-gold)]/50 text-xs">
              Scroll for more steps ↓
            </p>
          </motion.div>
        </div>
      ) : (
        /* DESKTOP VIEW */
        <div className="py-20 px-8">
          {/* Fixed Progress Indicator - Desktop Only */}
          <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              
              return (
                <div key={step.id} className="relative group">
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.4 : 0.8,
                      opacity: isActive ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-3 h-3 rounded-full bg-[var(--beesee-gold)] shadow-[0_0_15px_rgba(253,204,0,0.8)] cursor-pointer"
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="bg-black/95 border border-[var(--beesee-gold)]/30 text-[var(--beesee-gold)] text-xs px-3 py-2 rounded shadow-lg">
                      <span className="font-semibold">Step {step.id}</span>
                      <p className="text-[10px] text-[#C7B897] mt-0.5 max-w-[180px]">{step.short}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--beesee-gold)]/20 -translate-x-1/2 -z-10" />
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-center mb-16"
            >
              <h2 className="bee-title-lg text-[var(--beesee-gold)] mb-4">
                SCHOOL PROCESS
              </h2>
              <p className="bee-body text-[#C7B897]/80 max-w-2xl mx-auto text-lg">
                A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
              </p>
            </motion.div>

            {/* Staggered Cards Layout */}
            <div className="space-y-32">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                const cardRef = useRef(null);
                const isInView = useInView(cardRef, { once: false, amount: 0.4 });

                return (
                  <motion.div
                    key={step.id}
                    ref={cardRef}
                    data-step-card
                    initial={{ opacity: 0, y: 100 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
                  >
                    {/* Image Side */}
                    <motion.div
                      initial={{ x: isEven ? -50 : 50, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: isEven ? -50 : 50, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`relative ${!isEven ? 'lg:col-start-2' : ''}`}
                    >
                      <div className="relative rounded-3xl overflow-hidden border-2 border-[var(--beesee-gold)]/30 shadow-[0_0_40px_rgba(253,204,0,0.15)] group">
                        <img 
                          src={step.image}
                          alt={step.title}
                          className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        
                        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-[var(--beesee-gold)] flex items-center justify-center border-4 border-black/30 shadow-xl">
                          <span className="text-3xl font-bold text-black">{step.id}</span>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-[var(--beesee-gold)] text-sm font-semibold mb-2 tracking-wide">
                            STEP {step.id} OF {steps.length}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                      initial={{ x: isEven ? 50 : -50, opacity: 0 }}
                      animate={isInView ? { x: 0, opacity: 1 } : { x: isEven ? 50 : -50, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}
                    >
                      <div className="space-y-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "80px" } : { width: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          className="h-1 bg-[var(--beesee-gold)] rounded"
                        />
                        
                        <h3 className="bee-title-md text-[var(--beesee-gold)] leading-tight">
                          {step.title}
                        </h3>
                        
                        <p className="bee-body-lg text-[#C7B897] font-medium">
                          {step.short}
                        </p>
                        
                        <p className="bee-body text-[#C7B897]/80 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="flex items-center gap-3 pt-4">
                          <div className="flex gap-2">
                            {[...Array(steps.length)].map((_, i) => (
                              <div 
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  i === index 
                                    ? "w-12 bg-[var(--beesee-gold)]" 
                                    : "w-1.5 bg-[var(--beesee-gold)]/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StepperSection;