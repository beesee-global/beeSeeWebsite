import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "../../../../utils/lucideIconLoader";
import { getIconNameForSpec } from "../../../../config/specIconMap";

export type Product = {
  pid: string;
  name: string;
  tagline: string;
  category: string;
  image: string;
  price: number;
  specs: { [key: string]: string };
  specIcons?: { [key: string]: string };
  quickHighlights?: Array<{ key: string; value: string; icon?: string }>;
  hoverSpecs?: string[];
  category_id?: string; // Add this for category detection
};

// Helper: prettify a key into a readable label
const prettify = (k: string) => {
  if (!k) return '';
  // If it's already in title case or contains spaces (API-provided), return as-is
  if (/[A-Z]/.test(k) || k.includes(' ')) return k;
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Format spec values for display (normalize RAM, storage, etc.)
const formatSpecValue = (key: string, value: string) => {
  if (!value) return '';
  const k = (key || '').toString().toLowerCase();

  // Normalize RAM values to "{n}GB RAM"
  if (k === 'ram' || k.includes('ram')) {
    // If already contains 'ram', just normalize spacing
    if (/\bram\b/i.test(value)) {
      // extract number+GB if present
      const m = value.match(/(\d+(?:\.\d+)?)\s*GB/i);
      if (m) return `${m[1]}GB RAM`;
      return value.replace(/\s+/g, ' ').trim();
    }

    // Try to find a GB token
    const m = value.match(/(\d+(?:\.\d+)?)\s*(GB|G)\b/i);
    if (m) return `${m[1]}GB RAM`;

    // Fallback: extract first number and assume GB
    const m2 = value.match(/(\d+(?:\.\d+)?)/);
    if (m2) return `${m2[1]}GB RAM`;

    return value;
  }

  return value;
};

// Product uploads may contain an opaque #111827 canvas around the artwork.
// Remove that canvas so the image inherits the product-card background.
const useTransparentProductImage = (source: string) => {
  const [processedSource, setProcessedSource] = useState(source);
  const generatedUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!source) {
      setProcessedSource(source);
      return;
    }

    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas is unavailable");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let offset = 0; offset < pixels.data.length; offset += 4) {
          const distance = Math.hypot(
            pixels.data[offset] - 17,
            pixels.data[offset + 1] - 24,
            pixels.data[offset + 2] - 39
          );
          if (distance < 38) pixels.data[offset + 3] = 0;
          else if (distance < 72) pixels.data[offset + 3] = Math.round(((distance - 38) / 34) * 255);
        }
        context.putImageData(pixels, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob || !active) return;
          const generatedUrl = URL.createObjectURL(blob);
          generatedUrlsRef.current.push(generatedUrl);
          setProcessedSource(generatedUrl);
        }, "image/png");
      } catch {
        if (active) setProcessedSource(source);
      }
    };
    image.onerror = () => active && setProcessedSource(source);
    image.src = source;

    return () => {
      active = false;
    };
  }, [source]);

  useEffect(() => () => {
    generatedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    generatedUrlsRef.current = [];
  }, []);

  return processedSource;
};

// Render spec value; if multiple options (comma, slash, pipe) show vertically
const renderSpecValue = (key: string, raw: any) => {
  if (raw == null) return null;
  const v = String(raw).trim();

  // detect separators indicating multiple variants
  if (/[\/|,]/.test(v)) {
    // split on /, |, or , and trim
    const parts = v.split(/\s*[\/|,]\s*/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className="spec-variants-value flex flex-col items-center gap-1">
        <span className="spec-variants-label">Available variants</span>
        {parts.map((p, i) => (
          <div key={i} className="spec-value-enhanced">{formatSpecValue(key, p)}</div>
        ))}
      </div>
    );
  }

  return <div className="spec-value-enhanced">{formatSpecValue(key, v)}</div>;
};

const ProductCard: React.FC<{
  product: Product;
  index: number;
  isMobile?: boolean;
  categoryHoverSpecs?: string[];
}> = ({ product, index, isMobile = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const transparentImage = useTransparentProductImage(product.image);
  const prefersReducedMotion = useReducedMotion();

  // Build hover specs from API-provided `product.specs` (preserve insertion order)
  const hoverSpecs = React.useMemo(() => {
    const MAX_SPECS = 4;
    if (product.quickHighlights?.length) {
      return product.quickHighlights.slice(0, MAX_SPECS);
    }
    const entries = Object.entries(product.specs || {}).map(([key, value]) => ({ key, value, icon: undefined }));

    // If OS / smart features exists, prioritize it so it appears in the top N
    const hasSmart = Object.keys(product.specs || {}).some(k => k.toLowerCase() === 'smart_features' || k.toLowerCase() === 'os' || k.toLowerCase() === 'operating_system' || k.toLowerCase() === 'operating system');

    if (!hasSmart) return entries.slice(0, MAX_SPECS);

    // Move the smart_features entry into the top N slots
    const smartKeyIdx = entries.findIndex(({ key }) => ['smart_features','os','operating_system','operating system'].includes(key.toLowerCase()));
    if (smartKeyIdx === -1) return entries.slice(0, MAX_SPECS);

    const smartEntry = entries[smartKeyIdx];
    const withoutSmart = entries.filter((_, i) => i !== smartKeyIdx);

    // Insert smart entry at position 2 (after two primary specs) to ensure visibility
    const insertAt = Math.min(2, withoutSmart.length);
    withoutSmart.splice(insertAt, 0, smartEntry);

    return withoutSmart.slice(0, MAX_SPECS);
  }, [product.quickHighlights, product.specs, product.specIcons]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // The entire card is a single detail link. Hover/focus only controls the spec preview.
  return (
    <motion.div
      initial={
        prefersReducedMotion
          ? false
          : isMobile
            ? { opacity: 0, x: -36 }
            : { opacity: 0, y: 20, scale: 0.98 }
      }
      animate={!isMobile && !prefersReducedMotion ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined}
      whileInView={isMobile && !prefersReducedMotion ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.18 } : undefined}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.42,
        delay: isMobile && !prefersReducedMotion ? Math.min(index, 5) * 0.08 : 0,
        ease: "easeOut",
      }}
      className="product-card-glow-master group"
    >
      <Link
        to={`/product/${product.pid}`}
        className="product-card-detail-link"
        aria-label={`View details for ${product.name}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {/* ELEGANT STATIC GLOW SYSTEM - No moving lights */}
        <div className="glow-container">
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FDCC00]/30 transition-all duration-500" />
          <div className="absolute inset-[-2px] bg-gradient-to-br from-[#FDCC00]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/40 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/40 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/40 transition-all duration-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/40 transition-all duration-500" />
        </div>

        {/* CARD CONTENT */}
        <div className="card-content-glow">
        {/* IMAGE */}
        <div className="product-image-container">
          <img src={transparentImage} alt={product.name} className="product-image" loading="lazy" />

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
                  {hoverSpecs.map(({ key, value, icon }, i) => {
                      const iconName = icon || product.specIcons?.[key] || getIconNameForSpec(key);
                      const label = prettify(key);

                      return (
                        <motion.div
                          key={`${key}-${i}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="spec-item-enhanced"
                        >
                          <div className="spec-icon-enhanced">
                            <LucideIcon name={iconName} size={18} className="text-black" />
                          </div>

                          <div className="spec-content">
                            <div className="spec-label-enhanced">{label}</div>
                            {Array.isArray(value) ? (
                               <div className="spec-variants-value flex flex-col items-center gap-1">
                                <span className="spec-variants-label">Available variants</span>
                                {value.map((v: any, idx: number) => (
                                  <div key={idx} className="spec-value-enhanced">{v}</div>
                                ))}
                              </div>
                            ) : (
                              renderSpecValue(key, value)
                            )}
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
          <h3 className="product-name">
            {product.name}
          </h3>
          <p className="product-tagline">{product.tagline}</p>
          <p className="product-price">
            {/* {formatPrice(product.price)} */}
          </p>
        </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default React.memo(ProductCard);
