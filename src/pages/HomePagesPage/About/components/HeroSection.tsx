import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView, Variants } from "framer-motion";
import { Heart, Target } from "lucide-react";

// Mock images 
const buildingBeesee = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

const UnifiedScrollingPage: React.FC = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for view detection
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  
  // Track if sections are in view
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const storyInView = useInView(storyRef, { once: false, amount: 0.3 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation variants
  const slideInLeft: Variants = {
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

  const slideInRight: Variants = {
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

  const slideInDown: Variants = {
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

  const slideInCard: Variants = {
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

  // Helper function to determine animation
  const getAnimationState = (inView: boolean) => {
    if (isMobile) return "visible";
    return inView ? "visible" : "exit";
  };

  // ========== HERO CONTENT WITH DESKTOP LEFT ALIGN ==========
  const renderHeroContent = () => {
    const content = (
      <>
        {/* Hero Text */}
        <div className={`${isMobile ? "text-center" : "text-left"} space-y-1 md:space-y-1.5`}>
          <h1 className="bee-title-lg text-[var(--beesee-gold)] leading-[1.05] tracking-tight">
            <span className="block">PHILIPPINE-BORN</span>
            <span className="block">INNOVATION ENGINEERED</span>
            <span className="block">FOR THE GLOBAL STAGE</span>
          </h1>
        </div>

        {/* Body Text */}
        <p className={`bee-body-lg max-w-xl text-[#C7B897] leading-relaxed mt-3 md:mt-4 px-2 md:px-0 ${isMobile ? "text-center" : "text-left"}`}>
          BeeSee Global Technologies creates hardware, software, and scalable
          learning ecosystems built for Philippine environments and deployed
          to the world.
        </p>

        {/* WATCH VIDEO + Innovation Stats
        <div className={`flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 pt-3 md:pt-4 px-2 md:px-0 ${isMobile ? "items-center justify-center" : "items-start justify-start"}`}>
          <button
            onClick={() => setShowVideo(true)}
            className="beesee-button beesee-button--small flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 px-6 py-3 w-full sm:w-auto"
          >
            WATCH VIDEO
          </button>

          <div className="space-y-1 bee-body-sm text-[#C7B897] text-center sm:text-left">
            <div className="text-[var(--beesee-gold)] font-semibold">10+ Years in Innovation</div>
            <div className="text-[#C7B897]/80">ICT • STEM • Enterprise Development</div>
          </div>
        </div>  */}
      </>
    );

    if (isMobile) {
      return <div className="space-y-4 w-full">{content}</div>;
    }

    return (
      <motion.div
        variants={slideInLeft}
        initial="hidden"
        animate={getAnimationState(heroInView)}
        className="space-y-4 md:space-y-6 w-full"
      >
        {content}
      </motion.div>
    );
  };

  const renderHeroCard = () => {
    const cardContent = (
      <div className="beesee-card-content section-two-card bg-[#000]/30 border border-[var(--beesee-gold)]/30 rounded-2xl backdrop-blur-lg shadow-[0_0_15px_rgba(253,204,0,0.08)] hover:scale-105 hover:border-[#FDCC00]/60 hover:shadow-[0_0_50px_rgba(253,204,0,0.15)] transition-transform duration-300 p-4 md:p-6">
        <AnimatePresence mode="wait">
          {showVideo ? (
            <div className="rounded-xl overflow-hidden aspect-[16/9]">
              <iframe
                src="https://www.youtube.com/embed/ysz5S6PUM-U?autoplay=1&mute=1&modestbranding=1&rel=0"
                allowFullScreen
                className="w-full h-full"
                title="BeeSee Global Technologies Story"
              />
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden aspect-[16/9] relative group cursor-pointer">
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
            className="bee-body-sm text-[var(--beesee-gold)] hover:text-white transition mt-3 md:mt-4 w-full text-center block"
          >
            ✕ Close Video
          </button>
        )}
      </div>
    );

    if (isMobile) {
      return <div className="mt-4 md:mt-6 px-2 md:px-0">{cardContent}</div>;
    }

    return (
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate={getAnimationState(heroInView)}
        className="mt-4 md:mt-6 px-2 md:px-0"
      >
        {cardContent}
      </motion.div>
    );
  };

  const renderStoryHeader = () => {
    const content = (
      <div className="text-center mb-4 md:mb-6 px-2 md:px-0">
        <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1] mb-2 md:mb-3 px-2">
          From Local Vision to Global Footprint
        </h2>
        <p className="bee-body-lg max-w-2xl mx-auto text-[#C7B897]/90 mt-2 md:mt-3 leading-relaxed px-4">
          We started as a small team solving pain points in Philippine schools.
          Today, we build devices, content, and programs trusted by institutions
          nationwide—and ready for the world.
        </p>
      </div>
    );

    if (isMobile) {
      return content;
    }

    return (
      <motion.div
        variants={slideInDown}
        initial="hidden"
        animate={getAnimationState(storyInView)}
      >
        {content}
      </motion.div>
    );
  };

  const renderMissionVisionCard = (icon: React.ReactNode, title: string, content: string, index: number) => {
    const card = (
      <div className="beesee-card-content hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300 rounded-2xl p-4 md:p-6 mx-2 md:mx-0">
        <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-center gap-3 md:gap-4'} mb-3 md:mb-4`}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: "text-[var(--beesee-gold)] w-7 h-7 md:w-8 md:h-8"
          })}
          <h3 className={`bee-title-sm text-[var(--beesee-gold)] ${isMobile ? 'mt-1.5' : ''}`}>
            {title}
          </h3>
        </div>
        <p className="bee-body-lg text-[#C7B897]/90 leading-relaxed text-center md:text-left">
          {content}
        </p>
      </div>
    );

    if (isMobile) {
      return <div className="px-2">{card}</div>;
    }

    return (
      <motion.div
        custom={index}
        variants={slideInCard}
        initial="hidden"
        animate={getAnimationState(storyInView)}
      >
        {card}
      </motion.div>
    );
  };

  return (
    <div className="relative bg-[#000000]">

      {/* GLOBAL BACKGROUND VIDEO */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/live-background/sectionThree.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#000000]/70" />
      </div>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative flex items-start z-10 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-12 lg:py-16 min-h-[55vh]"
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
          {renderHeroContent()}
          {renderHeroCard()}
        </div>
      </section>

      {/* COMPANY STORY SECTION */}
      <section 
        ref={storyRef}
        className="relative z-10 flex flex-col items-center px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-12 lg:py-16 min-h-[50vh]"
      >
        <div className="max-w-7xl w-full">
          {renderStoryHeader()}
          
          <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {renderMissionVisionCard(
              <Heart />,
              "MISSION",
              "To democratize advanced, human-centered technology for education and enterprise — making premium solutions accessible, sustainable, and rooted in real Philippine needs.",
              0
            )}
            
            {renderMissionVisionCard(
              <Target />,
              "VISION",
              "To establish Philippine-designed technologies as globally trusted — powering future-ready classrooms, campuses, and workplaces across Asia and beyond.",
              1
            )}
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#000] z-[1]" />
    </div>
  );
};

export default UnifiedScrollingPage;