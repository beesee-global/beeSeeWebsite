import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Database, Cloud, Microchip, Zap, Monitor, Keyboard, Volume2, Battery, HardDrive, Wifi, Settings } from "lucide-react";

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

  // EXPANDED specIcons object to include more spec types
  const specIcons: Record<string, any> = {
    cpu: Cpu,
    ram: Microchip,
    ssd: Database,
    storage: Cloud,
    display: Monitor,
    battery: Battery,
    gpu: Cpu,
    switches: Keyboard,
    backlight: Settings,
    connectivity: Wifi,
    resolution: Monitor,
    brightness: Zap,
    microphone: Volume2,
    capacity: HardDrive,
    dpi: Settings,
    buttons: Settings,
    ports: Settings,
    compatibility: Settings,
    pattern: Settings,
    frequency: Settings,
    material: Settings,
    height: Settings,
    // Add fallbacks for capitalized keys
    SWITCHES: Keyboard,
    BACKLIGHT: Settings,
    CONNECTIVITY: Wifi,
    RESOLUTION: Monitor,
    BRIGHTNESS: Zap,
    MICROPHONE: Volume2,
    CAPACITY: HardDrive,
    DPI: Settings,
    BUTTONS: Settings,
    PORTS: Settings,
    COMPATIBILITY: Settings,
    PATTERN: Settings,
    FREQUENCY: Settings,
    MATERIAL: Settings,
    HEIGHT: Settings,
  };

  // EXPANDED specLabels object
  const specLabels: Record<string, string> = {
    cpu: "Processor",
    ram: "RAM",
    ssd: "SSD",
    storage: "Storage",
    display: "Display",
    battery: "Battery",
    gpu: "Graphics",
    switches: "Switches",
    backlight: "Backlight",
    connectivity: "Connectivity",
    resolution: "Resolution",
    brightness: "Brightness",
    microphone: "Microphone",
    capacity: "Capacity",
    dpi: "DPI",
    buttons: "Buttons",
    ports: "Ports",
    compatibility: "Compatibility",
    pattern: "Pattern",
    frequency: "Frequency",
    material: "Material",
    height: "Height",
    // Add fallbacks for capitalized keys
    SWITCHES: "Switches",
    BACKLIGHT: "Backlight",
    CONNECTIVITY: "Connectivity",
    RESOLUTION: "Resolution",
    BRIGHTNESS: "Brightness",
    MICROPHONE: "Microphone",
    CAPACITY: "Capacity",
    DPI: "DPI",
    BUTTONS: "Buttons",
    PORTS: "Ports",
    COMPATIBILITY: "Compatibility",
    PATTERN: "Pattern",
    FREQUENCY: "Frequency",
    MATERIAL: "Material",
    HEIGHT: "Height",
  };

  const topSpecs = Object.entries(product.specs || {})
    .slice(0, 4);

  // Function to normalize spec keys (convert to lowercase)
  const normalizeSpecKey = (key: string): string => {
    return key.toLowerCase();
  };

  // MOBILE VERSION - No hover effects, simple clickable card, NO VIEW BUTTON
  if (isMobile) {
    return (
      <div
        // DISABLED CLICK NAVIGATION
        // onClick={onClick}
        className={`product-card-glow-master relative transition-transform duration-200 ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}`}
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
      className="product-card-glow-master"
      // DISABLED CLICK NAVIGATION
      // onClick={onClick}
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
                    const normalizedKey = normalizeSpecKey(key);
                    const Icon = specIcons[normalizedKey] || specIcons[key] || Settings;
                    const label = specLabels[normalizedKey] || specLabels[key] || key;

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