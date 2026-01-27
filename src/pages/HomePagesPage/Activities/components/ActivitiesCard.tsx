import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mockActivities from "../../../../data/mockActivities.json";
import activitiesBg from "../../../../../public/live-background/activitiesReal.jpeg";

interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  coverImage: string;
  description: string;
  images: string[];
}

const ActivitiesCard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activities: Activity[] = mockActivities;

  const handleCardClick = (id: string) => {
    navigate(`/activity/${id}`);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${activitiesBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // keep background steady
      }}
    >
      {/* BLACK OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* FADE TOP OVERLAY TO BLEND INTO PREVIOUS BLACK PAGE */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black to-transparent z-10" />

      <section className="relative scroll-section z-20 min-h-screen flex flex-col items-center py-16 md:py-24 px-4 md:px-10 lg:px-12 w-full">
        <div className="relative z-20 max-w-7xl mx-auto w-full">
          {/* TITLE */}
          <div className="text-center mb-12 md:mb-20">
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-4">
              BSG CORE MEMORIES
            </h3>
            <p className="bee-body max-w-3xl mx-auto text-[#C7B897]">
              Capturing the essence of innovation, collaboration, and celebration—explore our journey through memorable events and milestones.
            </p>
          </div>

          {/* GRID: original spacing and size retained */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                isMobile={isMobile}
                onClick={() => handleCardClick(activity.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
  isMobile: boolean;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index,
  isMobile,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "-80px 0px" }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.96 }
      }
      transition={{
        duration: 0.8,
        delay: isMobile ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative cursor-pointer beesee-card-content z-20"
      onClick={onClick}
    >
      <motion.div
        className="relative overflow-hidden rounded-xl md:rounded-2xl bg-black aspect-[4/5]"
        whileHover={isMobile ? {} : { scale: 1.03 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          whileHover={isMobile ? {} : { scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--beesee-gold)]/40 rounded-xl md:rounded-2xl transition-all duration-500" />

        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
          <motion.div
            className="flex flex-wrap gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500"
            initial={false}
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-[var(--beesee-gold)]/30">
              <Calendar size={12} className="text-[var(--beesee-gold)]" />
              <span className="text-xs text-white font-medium">{activity.date}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-[var(--beesee-gold)]/30">
              <MapPin size={12} className="text-[var(--beesee-gold)]" />
              <span className="text-xs text-white font-medium">{activity.location}</span>
            </div>
          </motion.div>

          <h4 className="bee-title-sm text-white group-hover:text-[var(--beesee-gold)] transition-colors duration-500 mb-2">
            {activity.title}
          </h4>

          {/* FULL DESCRIPTION VISIBLE */}
          <p className="bee-body text-sm text-[#C7B897]/80">
            {activity.description}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 -z-10 rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, var(--beesee-gold), transparent)",
        }}
      />
    </motion.div>
  );
};

export default ActivitiesCard;
