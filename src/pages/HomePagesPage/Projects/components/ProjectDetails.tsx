import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Code,
  Target,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import mockProjects from "../../../../data/mockProjects.json";

interface Project {
  id: string;
  title: string;
  completionDate: string;
  techStack: string;
  coverImage: string;
  description: string;
  fullDescription: string;
  objectives: string[];
  features: string[];
  technologies: string[];
  images: string[];
}

interface ProductDetailsProps {
  id?: string;
}

const IMAGES_PER_PAGE = 12;

const ProductDetails: React.FC<ProductDetailsProps> = ({ id: propId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = propId || paramId;

  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "tech">("overview");

  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const projects: Project[] = mockProjects;
  const projectData = projects.find((project) => project.id === projectId) || projects[0];

  const totalPages = Math.ceil(projectData.images.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const paginatedImages = projectData.images.slice(startIndex, startIndex + IMAGES_PER_PAGE);

  const openLightbox = (absoluteIndex: number) => {
    setSelectedPhoto(absoluteIndex);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    document.body.style.overflow = "";
  };

  const goToPrevious = () => {
    if (selectedPhoto !== null && selectedPhoto > 0) setSelectedPhoto(selectedPhoto - 1);
  };

  const goToNext = () => {
    if (selectedPhoto !== null && selectedPhoto < projectData.images.length - 1)
      setSelectedPhoto(selectedPhoto + 1);
  };

  const handleBackClick = () => navigate(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return;
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentPage(1);
  }, [projectId]);

  return (
    <div className="relative bg-[#000000] min-h-screen w-full overflow-x-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleBackClick}
        className="fixed top-6 left-6 z-[100] flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/40 hover:bg-[var(--beesee-gold)]/30 transition-all text-[var(--beesee-gold)]"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Portfolio</span>
      </motion.button>

      {/* HERO HEADER */}
      <motion.section
        ref={headerRef}
        className="relative min-h-[60vh] flex items-end justify-center overflow-hidden"
        style={{ opacity: headerOpacity, scale: headerScale }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={projectData.coverImage}
            alt={projectData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>
      </motion.section>

      {/* TITLE SECTION - MOVED TO BELOW THE HERO, SAME LEVEL AS OVERVIEW */}
      <section className="relative py-12 px-6 md:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Title & Details - This will align with Project Overview */}
          <div className="mb-8">
            <h1 className="bee-title-lg text-[var(--beesee-gold)] gold-glow mb-2">
              {projectData.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-[#C7B897] bee-body-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <Calendar size={18} className="text-[var(--beesee-gold)]" />
                <span>{projectData.completionDate}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <Code size={18} className="text-[var(--beesee-gold)]" />
                <span>{projectData.techStack}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <section className="relative py-12 px-6 md:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-center gap-4">
          {["overview", "features", "tech"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === tab
                  ? "bg-[var(--beesee-gold)] text-black"
                  : "bg-[var(--beesee-gold)]/20 text-[var(--beesee-gold)]"
              }`}
            >
              {tab === "overview"
                ? "Overview"
                : tab === "features"
                ? "Features"
                : "Technology"}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENT SECTIONS */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.section
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative py-12 px-6 md:px-10 lg:px-12"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-6">
                Project Overview
              </h3>
              <p className="bee-body text-[#e8e8e8] leading-relaxed mb-16">
                {projectData.fullDescription}
              </p>

              <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-12">
                Project Objectives
              </h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {projectData.objectives.map((objective, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--beesee-gold)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl" />
                    <div className="relative p-6 bg-black/60 border-2 border-[var(--beesee-gold)]/30 rounded-xl hover:border-[var(--beesee-gold)]/60 transition-all duration-300 backdrop-blur-sm h-full">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[var(--beesee-gold)]/10 rounded-lg border border-[var(--beesee-gold)]/30 flex-shrink-0">
                          <Target size={24} className="text-[var(--beesee-gold)]" />
                        </div>
                        <p className="bee-body text-[#e8e8e8] leading-relaxed text-left">{objective}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === "features" && (
          <motion.section
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative py-12 px-6 md:px-10 lg:px-12 bg-[var(--beesee-gold)]/5"
          >
            <div className="max-w-7xl mx-auto">
              <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-12 text-center">
                Key Features & Capabilities
              </h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {projectData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--beesee-gold)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl" />
                    <div className="relative p-6 bg-black/60 border-2 border-[var(--beesee-gold)]/30 rounded-xl hover:border-[var(--beesee-gold)]/60 transition-all duration-300 backdrop-blur-sm h-full">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[var(--beesee-gold)]/10 rounded-lg border border-[var(--beesee-gold)]/30 flex-shrink-0">
                          <CheckCircle2 size={24} className="text-[var(--beesee-gold)]" />
                        </div>
                        <p className="bee-body text-[#e8e8e8] leading-relaxed">{feature}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === "tech" && (
          <motion.section
            key="tech"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative py-16 px-6 md:px-10 lg:px-12"
          >
            <div className="max-w-7xl mx-auto text-center">
              <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-12">
                Technologies Used
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {projectData.technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-[var(--beesee-gold)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-md" />
                    <div className="relative px-6 py-4 bg-black/40 border-2 border-[var(--beesee-gold)]/30 rounded-lg hover:border-[var(--beesee-gold)]/60 hover:bg-black/60 transition-all duration-300 backdrop-blur-sm">
                      <span className="bee-body-sm text-[var(--beesee-gold)] font-medium">{tech}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SCREENSHOTS GALLERY */}
      <section className="relative py-12 px-6 md:px-10 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-4">
              Project Screenshots
            </h3>
            <p className="bee-body text-[#C7B897]">
              {projectData.images.length} screenshots showcasing the system
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedImages.map((imageUrl, index) => {
              const absoluteIndex = startIndex + index;
              return (
                <motion.div
                  key={absoluteIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(absoluteIndex)}
                >
                  <img
                    src={imageUrl}
                    alt={`Screenshot ${absoluteIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={32} />
                  </div>
                  <div className="absolute inset-0 border-2 border-[var(--beesee-gold)]/0 group-hover:border-[var(--beesee-gold)]/60 rounded-lg transition-all duration-300" />
                </motion.div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-14">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)] disabled:opacity-40"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm border ${
                    currentPage === i + 1
                      ? "bg-[var(--beesee-gold)] text-black"
                      : "border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)]"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
            onClick={closeLightbox}
          >
            <motion.button
              className="absolute top-6 right-6 z-[10000] p-3 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40"
              onClick={closeLightbox}
            >
              <X className="text-[var(--beesee-gold)]" size={24} />
            </motion.button>

            {selectedPhoto > 0 && (
              <motion.button
                className="absolute left-6 z-[10000] p-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="text-[var(--beesee-gold)]" size={32} />
              </motion.button>
            )}

            {selectedPhoto < projectData.images.length - 1 && (
              <motion.button
                className="absolute right-6 z-[10000] p-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="text-[var(--beesee-gold)]" size={32} />
              </motion.button>
            )}

            <motion.img
              src={projectData.images[selectedPhoto]}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;