import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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

  // Helper function to determine animation
  const getAnimationState = (inView: boolean) => {
    if (isMobile) return "visible";
    return inView ? "visible" : "exit";
  };

  // ========== FIXED: Use consistent classes like Home page ==========
  const renderHeroContent = () => {
    const content = (
      <>
        {/* FIXED: Use bee-title-lg consistently */}
        <h1 className="bee-title-lg text-[var(--beesee-gold)] leading-[1.05] max-w-3xl">
          PHILIPPINE-BORN<br />
          INNOVATION ENGINEERED<br />
          FOR THE GLOBAL STAGE
        </h1>

        {/* FIXED: Consistent body styling like Home page */}
        <p className="bee-body max-w-xl text-[#C7B897] leading-relaxed mt-4 md:mt-8">
          BeeSee Global Technologies creates hardware, software, and scalable
          learning ecosystems built for Philippine environments and deployed
          to the world.
        </p>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 md:pt-8">
          <button
            onClick={() => setShowVideo(true)}
            className="beesee-button beesee-button--small flex items-center gap-3 hover:scale-105 transition-transform duration-300 px-6 py-3"
          >
            WATCH OUR STORY
          </button>

          {/* FIXED: Use bee-body-sm like Home page */}
          <div className="space-y-1 bee-body-sm text-[#C7B897]">
            <div className="text-[var(--beesee-gold)] font-semibold">10+ Years in Innovation</div>
            <div className="text-[#C7B897]/80">ICT • STEM • Enterprise Development</div>
          </div>
        </div>
      </>
    );

    if (isMobile) {
      return <div className="space-y-4">{content}</div>;
    }

    return (
      <motion.div
        variants={slideInLeft}
        initial="hidden"
        animate={getAnimationState(heroInView)}
        className="space-y-6 md:space-y-8"
      >
        {content}
      </motion.div>
    );
  };

  const renderHeroCard = () => {
    const cardContent = (
      <div className="beesee-card-content section-two-card bg-[#000]/30 border border-[var(--beesee-gold)]/30 rounded-2xl backdrop-blur-lg shadow-[0_0_15px_rgba(253,204,0,0.08)] hover:scale-105 hover:border-[#FDCC00]/60 hover:shadow-[0_0_50px_rgba(253,204,0,0.15)] transition-transform duration-300 p-6 md:p-8">
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
            className="bee-body-sm text-[var(--beesee-gold)] hover:text-white transition mt-4"
          >
            ✕ Close Video
          </button>
        )}
      </div>
    );

    if (isMobile) {
      return <div className="mt-6">{cardContent}</div>;
    }

    return (
      <motion.div
        variants={slideInRight}
        initial="hidden"
        animate={getAnimationState(heroInView)}
        className="mt-8"
      >
        {cardContent}
      </motion.div>
    );
  };

  const renderStoryHeader = () => {
    const content = (
      <div className="text-center mb-8 md:mb-16">
        {/* FIXED: Use bee-title-md like Home page */}
        <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1] mb-4 md:mb-6">
          From Local Vision to Global Footprint
        </h2>
        {/* FIXED: Consistent body styling */}
        <p className="bee-body max-w-2xl mx-auto text-[#C7B897]/90 mt-4 md:mt-6 leading-relaxed">
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
      <div className="beesee-card-content hover:scale-105 hover:border-[#FDCC00]/40 hover:shadow-[0_0_15px_rgba(253,204,0,0.15)] transition-transform duration-300 rounded-2xl p-6 md:p-8">
        {/* FIXED: Align like Home page cards */}
        <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-center gap-4'} mb-4 md:mb-6`}>
          {React.cloneElement(icon as React.ReactElement, { 
            className: "text-[var(--beesee-gold)] w-8 h-8 md:w-10 md:h-10"
          })}
          {/* FIXED: Use bee-title-sm like Home page */}
          <h3 className={`bee-title-sm text-[var(--beesee-gold)] ${isMobile ? 'mt-2' : ''}`}>
            {title}
          </h3>
        </div>
        {/* FIXED: Consistent body styling */}
        <p className="bee-body text-[#C7B897]/90 leading-relaxed">
          {content}
        </p>
      </div>
    );

    if (isMobile) {
      return <div>{card}</div>;
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

      {/* HERO SECTION - FIXED: Reduced padding for mobile */}
      <section
        ref={heroRef}
        className={`relative flex items-start z-10 px-6 md:px-10 lg:px-14 py-12 md:py-24 ${
          isMobile ? "min-h-[60vh]" : "min-h-[85vh]"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center gap-8 md:gap-14">
          {renderHeroContent()}
          {renderHeroCard()}
        </div>
      </section>

      {/* COMPANY STORY SECTION - FIXED: Reduced padding for mobile */}
      <section 
        ref={storyRef}
        className={`relative z-10 flex flex-col items-center px-6 md:px-10 lg:px-14 py-12 md:py-24 ${
          isMobile ? "min-h-[60vh]" : "min-h-[80vh]"
        }`}
      >
        <div className="max-w-7xl w-full">
          {renderStoryHeader()}
          
          {/* FIXED: Consistent gap */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-12">
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