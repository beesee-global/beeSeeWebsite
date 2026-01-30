import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mockProjects from "../../../../data/mockProjects.json";
import projectsBg from "../../../../../public/live-background/4k.jpg";
import "../../../../assets/css/Activities.css";

interface Project {
  id: string;
  title: string;
  completionDate: string;
  techStack: string;
  coverImage: string;
  description: string;
  images: string[];
}

const ITEMS_PER_PAGE = 9;

const ProductCard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const projects: Project[] = mockProjects;

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProjects = projects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleCardClick = (id: string) => {
    navigate(`/project/${id}`);
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${projectsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* BLACK OVERLAY */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* FADE TOP OVERLAY */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black to-transparent z-10" />

      <section className="relative scroll-section z-20 min-h-screen flex flex-col items-center py-16 md:py-24 px-4 md:px-10 lg:px-12 w-full">
        <div className="relative z-20 max-w-7xl mx-auto w-full">
          {/* TITLE */}
          <div className="text-center mb-12 md:mb-20">
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-4">
              SYSTEM DEVELOPMENT PORTFOLIO
            </h3>
            <p className="bee-body max-w-3xl mx-auto text-[#C7B897]">
              Showcasing our expertise in developing innovative software solutions—from enterprise systems to web applications that drive digital transformation.
            </p>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {currentProjects.map((project, index) => (
              <ProjectCardItem
                key={project.id}
                project={project}
                index={index}
                isMobile={isMobile}
                onClick={() => handleCardClick(project.id)}
              />
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-14">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)] disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border ${
                      currentPage === page
                        ? "bg-[var(--beesee-gold)] text-black"
                        : "border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

interface ProjectCardItemProps {
  project: Project;
  index: number;
  isMobile: boolean;
  onClick: () => void;
}

const ProjectCardItem: React.FC<ProjectCardItemProps> = ({
  project,
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
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
        </motion.div>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--beesee-gold)]/40 rounded-xl md:rounded-2xl transition-all duration-500" />

        <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
          <motion.div className="flex flex-row flex-nowrap gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-[var(--beesee-gold)]/30 max-w-[45%]">
              <Calendar size={12} className="text-[var(--beesee-gold)]" />
              <span className="text-xs text-white truncate">{project.completionDate}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-[var(--beesee-gold)]/30 max-w-[50%]">
              <Code size={12} className="text-[var(--beesee-gold)]" />
              <span className="text-xs text-white truncate">{project.techStack}</span>
            </div>
          </motion.div>

          <h4 className="bee-title-sm text-white group-hover:text-[var(--beesee-gold)] transition-colors duration-500 mb-2">
            {project.title}
          </h4>

          <p className="bee-body text-sm text-[#C7B897]/80">
            {project.description}
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

export default ProductCard;