import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Calendar, Users, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Activity {
  id: string;
  title: string;
  date: string;
  coverImage: string;
  description: string;
  imageCount: number;
}

const ActivitiesCard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent horizontal scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflowX = "hidden";
      document.documentElement.style.overflowX = "hidden";
    }
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, [isMobile]);

  // Animation variants
  const textAnimation = {
    desktop: {
      up: { hidden: { opacity: 0, y: 80 }, visible: { opacity: 1, y: 0 } },
    },
    mobile: {
      up: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
    },
  };

  const transition = isMobile ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] };

  // Section refs
  const sectionTitleRef = useRef<HTMLDivElement>(null);
  const inViewTitle = useInView(sectionTitleRef, { once: isMobile, amount: 0.1 });

  // Get animation variants based on device
  const getTextVariants = (direction: "up") => {
    return isMobile ? textAnimation.mobile[direction] : textAnimation.desktop[direction];
  };

  // MOCK ACTIVITIES DATA
  const activities: Activity[] = [
    {
      id: "christmas-2024",
      title: "Christmas Celebration 2024",
      date: "December 25, 2024",
      coverImage: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80",
      description: "A magical evening of celebration, togetherness, and holiday cheer with the entire BeeSee family.",
      imageCount: 24,
    },
    {
      id: "tech-summit-2024",
      title: "Tech Innovation Summit 2024",
      date: "November 15, 2024",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      description: "Industry leaders gathered to explore cutting-edge technologies and digital transformation strategies.",
      imageCount: 18,
    },
    {
      id: "team-building-2024",
      title: "Annual Team Building Retreat",
      date: "October 10, 2024",
      coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
      description: "Strengthening bonds and fostering collaboration through outdoor adventures and team challenges.",
      imageCount: 32,
    },
    {
      id: "training-workshop-sept",
      title: "ICT Training Workshop",
      date: "September 20, 2024",
      coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      description: "Comprehensive hands-on training sessions empowering participants with essential digital skills.",
      imageCount: 15,
    },
    {
      id: "community-outreach",
      title: "Community Tech Outreach",
      date: "August 5, 2024",
      coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
      description: "Bringing technology education to underserved communities and inspiring the next generation.",
      imageCount: 28,
    },
    {
      id: "launch-event",
      title: "Product Launch Event",
      date: "July 12, 2024",
      coverImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
      description: "Unveiling our latest innovation with partners, clients, and technology enthusiasts.",
      imageCount: 21,
    },
  ];

  // Create an array of refs for each card
  const cardRefs = React.useRef<Array<React.RefObject<HTMLDivElement>>>([]);
  
  // Initialize refs
  activities.forEach((_, index) => {
    cardRefs.current[index] = React.createRef<HTMLDivElement>();
  });

  const handleCardClick = (id: string) => {
    // Navigate to detail page - FIXED: Changed from /activities/${id} to /activity/${id}
    navigate(`/activity/${id}`);
  };

  return (
    <div className="relative bg-[#000000] overflow-x-hidden w-full">
      {/* ================= GALLERY SECTION ================= */}
      <section className="scroll-section relative min-h-screen flex items-center z-10 overflow-hidden py-16 md:py-20 px-6 md:px-10 lg:px-12 w-full">
        {/* GOLD + BLACK FADE LAYERS
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(0, 0, 0, 1) 0%,
                rgba(0, 0, 0, 0.75) 5%,
                rgba(0, 0, 0, 0.35) 10%,
                rgba(0, 0, 0, 0) 15%,
                transparent 20%
              ),
              linear-gradient(
                to bottom,
                rgba(253, 204, 0, 0.35) 0%,
                rgba(253, 204, 0, 0.25) 15%,
                rgba(253, 204, 0, 0.15) 35%,
                rgba(253, 204, 0, 0.08) 55%,
                rgba(253, 204, 0, 0.03) 75%,
                rgba(253, 204, 0, 0.00) 100%
              ),
              linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 78%,
                rgba(0,0,0,0.00) 100%
              )
            `,
          }}
        />  */}

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* TITLE */}
          <motion.div
            ref={sectionTitleRef}
            initial="hidden"
            animate={inViewTitle ? "visible" : "hidden"}
            variants={getTextVariants("up")}
            transition={transition}
            className="text-center mb-16"
          >
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow">BSG CORE MEMORIES</h3>
            <p className="bee-body max-w-3xl mx-auto mt-4 text-[#C7B897]">
              Capturing the essence of innovation, collaboration, and celebration—explore our journey through memorable events and milestones.
            </p>
          </motion.div>

          {/* GALLERY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {activities.map((activity, index) => {
              const cardRef = cardRefs.current[index];
              const inViewCard = useInView(cardRef, { once: isMobile, amount: 0.1 });

              return (
                <motion.div
                  key={activity.id}
                  ref={cardRef}
                  initial="hidden"
                  animate={inViewCard ? "visible" : "hidden"}
                  variants={getTextVariants("up")}
                  transition={isMobile ? { duration: 0 } : { duration: 1.0, delay: index * 0.15, ease: "easeOut" }}
                  className="group relative cursor-pointer"
                  onClick={() => handleCardClick(activity.id)}
                  onMouseEnter={() => setHoveredId(activity.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-2xl aspect-[4/5] w-full"
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {/* COVER IMAGE */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={activity.coverImage}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    </div>

                    {/* CARD BORDER GLOW */}
                    <div className="absolute inset-0 border-2 border-[var(--beesee-gold)]/0 group-hover:border-[var(--beesee-gold)]/40 rounded-2xl transition-all duration-500" />

                    {/* CONTENT OVERLAY */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      {/* Date badge */}
                      <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/30">
                          <Calendar size={14} className="text-[var(--beesee-gold)]" />
                          <span className="text-xs text-[var(--beesee-gold)] font-medium">{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/30">
                          <Camera size={14} className="text-[var(--beesee-gold)]" />
                          <span className="text-xs text-[var(--beesee-gold)] font-medium">{activity.imageCount} photos</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="bee-title-sm text-white mb-2 group-hover:text-[var(--beesee-gold)] transition-colors duration-300">
                        {activity.title}
                      </h4>

                      {/* Description */}
                      <p className="bee-body text-sm text-[#C7B897]/80 mb-4 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                        {activity.description}
                      </p>

                      {/* View More Button */}
                      <motion.div
                        className="flex items-center gap-2 text-[var(--beesee-gold)] opacity-0 group-hover:opacity-100 transition-all duration-500"
                        initial={{ x: -10 }}
                        animate={{ x: hoveredId === activity.id ? 0 : -10 }}
                      >
                        <span className="text-sm font-medium tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                          VIEW GALLERY
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </div>

                    {/* CORNER ACCENT */}
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[var(--beesee-gold)]/0 group-hover:border-[var(--beesee-gold)]/60 rounded-tr-xl transition-all duration-500" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[var(--beesee-gold)]/0 group-hover:border-[var(--beesee-gold)]/60 rounded-bl-xl transition-all duration-500" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ActivitiesCard;