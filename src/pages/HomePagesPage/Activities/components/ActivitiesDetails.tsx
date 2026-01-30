import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import mockActivities from "../../../../data/mockActivities.json";

interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  coverImage: string;
  description: string;
  fullDescription: string;
  images: string[];
}

interface ActivityDetailsProps {
  id?: string;
}

const IMAGES_PER_PAGE = 12;

const ActivitiesDetails: React.FC<ActivityDetailsProps> = ({ id: propId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = propId || paramId;

  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activities: Activity[] = mockActivities;
  const activityData =
    activities.find((activity) => activity.id === activityId) || activities[0];

  const totalPages = Math.ceil(
    activityData.images.length / IMAGES_PER_PAGE
  );

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const paginatedImages = activityData.images.slice(
    startIndex,
    startIndex + IMAGES_PER_PAGE
  );

  const openLightbox = (absoluteIndex: number) => {
    setSelectedPhoto(absoluteIndex);
    setZoomLevel(1);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setZoomLevel(1);
    document.body.style.overflow = "";
  };

  const goToPrevious = () => {
    if (selectedPhoto !== null && selectedPhoto > 0) {
      setSelectedPhoto(selectedPhoto - 1);
      setZoomLevel(1);
    }
  };

  const goToNext = () => {
    if (
      selectedPhoto !== null &&
      selectedPhoto < activityData.images.length - 1
    ) {
      setSelectedPhoto(selectedPhoto + 1);
      setZoomLevel(1);
    }
  };

  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));

  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));

  const handleBackClick = () => {
    navigate(-1);
  };

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
  }, [activityId]);

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
        <span className="text-sm font-medium">Back to Moments</span>
      </motion.button>

      {/* HEADER */}
      <section className="relative min-h-[60vh] flex items-end justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={activityData.coverImage}
            alt={activityData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="bee-title-lg text-[var(--beesee-gold)] gold-glow mb-6">
              {activityData.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <Calendar size={18} className="text-[var(--beesee-gold)]" />
                <span className="bee-body-sm text-[#C7B897]">
                  {activityData.date}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--beesee-gold)]/10 backdrop-blur-sm rounded-lg border border-[var(--beesee-gold)]/30">
                <MapPin size={18} className="text-[var(--beesee-gold)]" />
                <span className="bee-body-sm text-[#C7B897]">
                  {activityData.location}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="relative py-16 md:py-20 px-6 md:px-10 lg:px-12">
        <div className="max-w-7xl mx-auto text-center max-w-4xl">
          <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-6">
            About This Event
          </h3>
          <p className="bee-body text-[#e8e8e8] leading-relaxed">
            {activityData.fullDescription}
          </p>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      <section className="relative py-12 px-6 md:px-10 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow mb-4">
              Photo Gallery
            </h3>
            <p className="bee-body text-[#C7B897]">
              {activityData.images.length} photos capturing unforgettable moments
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
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(absoluteIndex)}
                >
                  <img
                    src={imageUrl}
                    alt={`Photo ${absoluteIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn
                      className="text-white opacity-0 group-hover:opacity-100"
                      size={32}
                    />
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
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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
                <ChevronLeft
                  className="text-[var(--beesee-gold)]"
                  size={32}
                />
              </motion.button>
            )}

            {selectedPhoto < activityData.images.length - 1 && (
              <motion.button
                className="absolute right-6 z-[10000] p-4 bg-[var(--beesee-gold)]/20 backdrop-blur-sm rounded-full border border-[var(--beesee-gold)]/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight
                  className="text-[var(--beesee-gold)]"
                  size={32}
                />
              </motion.button>
            )}

            <motion.img
              src={activityData.images[selectedPhoto]}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              style={{ scale: zoomLevel }}
              drag={zoomLevel > 1}
              dragConstraints={{
                left: -100,
                right: 100,
                top: -100,
                bottom: 100,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivitiesDetails;
