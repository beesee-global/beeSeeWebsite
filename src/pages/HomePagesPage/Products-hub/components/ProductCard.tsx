import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Monitor, Heart, Wifi, Settings, Zap, Cloud, Microchip, Battery } from "lucide-react";

type Product = {
  pid: string;
  name: string;
  tagline: string;
  category: string;
  image: string;
  price: number;
  specs: { [key: string]: string };
  category_id?: string; // Add this for category detection
};

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

// Category-specific hover specs mapping
const categoryHoverSpecs: Record<string, string[]> = {
  laptop: ["cpu", "ram", "storage", "display"],
  smartwatch: ["display", "battery", "sensors", "connectivity"],
  smarttv: ["display", "resolution", "panel_type", "refresh_rate"],
  tablet: ["cpu", "ram", "storage", "display"],
  kiosk: ["display", "cpu", "storage", "touchscreen"],
  // Default fallback
  default: ["cpu", "ram", "storage", "display"]
};

// Get 4 specs for hover based on category
const getHoverSpecs = (product: Product, categoryId?: string): Array<[string, string]> => {
  const specs = product.specs || {};
  
  // Get category-specific spec keys
  const categoryKeys = categoryId ? categoryHoverSpecs[categoryId] || categoryHoverSpecs.default : categoryHoverSpecs.default;
  
  // Collect specs based on category keys
  const hoverSpecs: Array<[string, string]> = [];
  
  // First, try to get category-specific specs
  for (const key of categoryKeys) {
    if (specs[key] && hoverSpecs.length < 4) {
      hoverSpecs.push([key, specs[key]]);
    }
  }
  
  // If we still need more specs, fill with any available specs
  if (hoverSpecs.length < 4) {
    const remainingKeys = Object.keys(specs).filter(key => 
      !hoverSpecs.some(([hoverKey]) => hoverKey === key)
    );
    
    for (const key of remainingKeys) {
      if (hoverSpecs.length < 4 && specs[key]) {
        hoverSpecs.push([key, specs[key]]);
      }
    }
  }
  
  // If still less than 4, fill with placeholder
  while (hoverSpecs.length < 4) {
    const placeholderKey = `spec_${hoverSpecs.length + 1}`;
    hoverSpecs.push([placeholderKey, "N/A"]);
  }
  
  return hoverSpecs;
};

const ProductCard: React.FC<{
  product: Product;
  index: number;
  onClick?: () => void;
  categoryHoverSpecs?: string[];
}> = ({ product, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  // Icon mapping for all spec types
  const specIcons: Record<string, any> = {
    cpu: Cpu,
    ram: Microchip,
    storage: Cloud,
    display: Monitor,
    battery: Battery,
    gpu: Cpu,
    connectivity: Wifi,
    resolution: Monitor,
    refresh_rate: Zap,
    sensors: Heart,
    smart_features: Settings,
    touchscreen: Settings,
  };

  // Label mapping for all spec types
  const specLabels: Record<string, string> = {
    cpu: "Processor",
    ram: "RAM",
    storage: "Storage",
    display: "Display",
    battery: "Battery",
    gpu: "Graphics",
    connectivity: "Connectivity",
    resolution: "Resolution",
    refresh_rate: "Refresh Rate",
    sensors: "Sensors",
    panel_type: "Panel Type",
    smart_features: "Smart Features",
    touchscreen: "Touchscreen",
  };

  // Get exactly 4 hover specs based on category
  const hoverSpecs = getHoverSpecs(product, product.category_id || product.category.toLowerCase());

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // MOBILE VERSION
  if (isMobile) {
    return (
      <div
        onClick={onClick}
        className="product-card-glow-master relative transition-transform duration-200 cursor-pointer active:scale-[0.98]"
      >
        <div className="glow-container">
          <div className="glow-orbit glow-orbit-1"></div>
        </div>

        <div className="card-content-glow">
          <div className="product-image-container">
            <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
          </div>

          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-tagline">{product.tagline}</p>
            <p className="product-price">
              {/* {formatPrice(product.price)} */}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP VERSION - With elegant hover effects
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="product-card-glow-master group cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ELEGANT STATIC GLOW SYSTEM - No moving lights */}
      <div className="glow-container">
        {/* Static gold border glow - subtle and elegant */}
        <div className="absolute inset-0 rounded-[24px] border-2 border-transparent group-hover:border-[#FDCC00]/30 transition-all duration-500" />
        
        {/* Subtle inner glow that pulses gently */}
        <div className="absolute inset-[-2px] rounded-[26px] bg-gradient-to-br from-[#FDCC00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Corner highlights */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FDCC00]/0 rounded-tl-[24px] group-hover:border-[#FDCC00]/40 transition-all duration-500" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FDCC00]/0 rounded-tr-[24px] group-hover:border-[#FDCC00]/40 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FDCC00]/0 rounded-bl-[24px] group-hover:border-[#FDCC00]/40 transition-all duration-500" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FDCC00]/0 rounded-br-[24px] group-hover:border-[#FDCC00]/40 transition-all duration-500" />
      </div>

      {/* CARD CONTENT */}
      <div className="card-content-glow">
        {/* IMAGE */}
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />

          {/* SPECS - Only show on hover (4 specs based on category) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="product-specs-overlay"
                transition={{ duration: 0.18 }}
              >
                <div className="specs-grid-four">
                  {hoverSpecs.map(([key, value], i) => {
                    const Icon = specIcons[key] || Settings;
                    const label = specLabels[key] || key;

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="spec-item-enhanced"
                      >
                        <div className="spec-icon-enhanced">
                          <Icon className="w-5 h-5 text-black" />
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
          <p className="product-price">
            {/* {formatPrice(product.price)} */}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);