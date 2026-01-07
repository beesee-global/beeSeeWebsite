import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Database, Cloud, Microchip, Zap, Monitor } from "lucide-react";

type ProductLike = {
  id?: number;
  pid?: string;
  name: string;
  tagline?: string;
  image?: string;
  specs?: { [k: string]: string | undefined };
};

// Mobile detection hook for ProductCard
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const ProductCard: React.FC<{
  product: ProductLike;
  index: number;
  onClick?: () => void;
}> = ({ product, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const specIcons: Record<string, any> = {
    cpu: Cpu,
    ram: Microchip,
    ssd: Database,
    storage: Cloud,
    display: Monitor,
    battery: Zap,
    gpu: Cpu,
  };

  const specLabels: Record<string, string> = {
    cpu: "Processor",
    ram: "Ram",
    ssd: "SSD",
    storage: "Storage",
    display: "Display",
    battery: "Battery",
    gpu: "Graphics",
  };

  const topSpecs = Object.entries(product.specs || {})
    .slice(0, 4);

  // MOBILE VERSION - No hover effects, simple clickable card, NO VIEW BUTTON
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="product-card-glow-master relative cursor-pointer active:scale-[0.98] transition-transform duration-200"
      >
        {/* SIMPLIFIED GLOW FOR MOBILE */}
        <div className="glow-container">
          <div className="glow-orbit glow-orbit-1"></div>
        </div>

        {/* CARD CONTENT */}
        <div className="card-content-glow">
          {/* IMAGE */}
          <div className="product-image-container">
            <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
            {/* REMOVED VIEW BUTTON - ENTIRE CARD IS CLICKABLE */}
          </div>

          {/* TEXT */}
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-tagline">{product.tagline}</p>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION - With hover effects
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="product-card-glow-master cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ADVANCED BORDER GLOW SYSTEM */}
      <div className="glow-container">
        <div className="glow-orbit glow-orbit-1"></div>
        <div className="glow-orbit glow-orbit-2"></div>
        <div className="glow-orbit glow-orbit-3"></div>
        <div className="glow-pulse"></div>
        <div className="glow-scan"></div>
      </div>

      {/* CARD CONTENT */}
      <div className="card-content-glow">
        {/* IMAGE */}
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />

          {/* SPECS - Only show on hover */}
          <AnimatePresence>
            {isHovered && topSpecs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="product-specs-overlay"
                transition={{ duration: 0.18 }}
              >
                <div className="specs-grid-four">
                  {topSpecs.map(([key, value], i) => {
                    const Icon = specIcons[key];
                    const label = specLabels[key] ?? key;

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="spec-item-enhanced"
                      >
                        <div className="spec-icon-enhanced">
                          {Icon && <Icon className="w-5 h-5 text-black" />}
                        </div>
                        <div className="spec-content">
                          <div className="spec-label-enhanced">{label}</div>
                          <div className="spec-value-enhanced">{value}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TEXT */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-tagline">{product.tagline}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);