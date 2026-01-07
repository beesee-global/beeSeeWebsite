import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveBanners } from "../../../../services/Ecommerce/bannerServices";

const ImageSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const { data: sliderResponse, isLoading } = useQuery({
    queryKey: ["slider"],
    queryFn: fetchActiveBanners,
  });

  const SLIDE_INTERVAL = 6000;
  const images = sliderResponse || [];

  const nextSlide = () => {
    if (images.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    if (images.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [images]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 1.05,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.6, ease: "easeIn" },
    }),
  };

  if (isLoading || images.length === 0 || !images[current]) return null;

  const currentBanner = images[current];

  return (
    <div className="product-slider-wrapper">
      <div className="product-slider-inner">
        <AnimatePresence custom={direction}>
          <motion.img
            key={current}
            src={currentBanner?.image}
            alt={currentBanner?.title || "Slide"}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="product-slider-image"
            loading="lazy"
          />
        </AnimatePresence>

        <div className="product-slider-overlay" />

        <div className="product-slider-content">
          {currentBanner?.title && (
            <p className="product-slider-kicker">FEATURED</p>
          )}
          <h2 className="product-slider-title">
            {currentBanner?.title ?? "Performance that keeps up with you."}
          </h2>
          {currentBanner?.description && (
            <p className="product-slider-text">{currentBanner.description}</p>
          )}
        </div>

        <button
          onClick={prevSlide}
          className="product-slider-nav-btn left"
          type="button"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={nextSlide}
          className="product-slider-nav-btn right"
          type="button"
        >
          <ChevronRight size={24} />
        </button>

        <div className="product-slider-dots">
          {images.map((_: any, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`product-slider-dot ${
                current === index ? "is-active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;