import React, { useEffect, useMemo, useState, useRef, lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Package, ArrowUp, ChevronLeft, ChevronRight, MessageCircle, X, ZoomIn, ZoomOut, Maximize2, PlayCircle, Download } from "lucide-react";
import { fetchAllProductPublic, fetchSpecificProductPublic } from '../../../services/Ecommerce/productServices'
import { useQuery } from "@tanstack/react-query";
import mockProducts from "../../../data/mockProductData.json";
import ProductInquiryModal from "./components/ProductInquiryModal";
import { LucideIcon } from "../../../utils/lucideIconLoader";
import { getIconNameForSpec } from "../../../config/specIconMap";
import axiosClient from "../../../axiosClient";
import DOMPurify from "dompurify";

// Lazy load the checkout modal for better performance
const CheckoutModal = lazy(() => import("./components/CheckoutModal"));

import "../../../assets/css/productDetails.css";

// Import your mock data
// mock data removed — rely on API via react-query

type DemoProduct = {
  pid: string;
  name: string;
  tagline?: string;
  gallery?: string[];
  videoUrl?: string;
  videoEmbedUrl?: string;
  videoEnabled?: boolean;
  brochureUrl?: string;
  brochureEnabled?: boolean;
  productSpecsHighlightUrl?: string;
  productSpecsHighlightEnabled?: boolean;
  basicInformationEnabled?: boolean;
  detailsEnabled?: boolean;
  galleryEnabled?: boolean;
  quickProductHighlightEnabled?: boolean;
  specificationsEnabled?: boolean;
  price?: number;
  description?: string;
  details?: string;
  keyFeatures?: string[];
  detailedSpecs?: Record<string, Record<string, string>>;
  hoverSpecs?: Array<{ key: string; value: string; icon?: string }>;
  category?: string;
  formattedPrice?: string;
  inStock?: boolean;
};

const createOrUpdateMeta = (name: string, content: string) => {
  let tag = document.head.querySelector(`meta[name='${name}']`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const createOrUpdateProperty = (property: string, content: string) => {
  let tag = document.head.querySelector(`meta[property='${property}']`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const createOrUpdateLink = (rel: string, href: string) => {
  let link = document.head.querySelector(`link[rel='${rel}']`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const sanitizeDetails = (html: string) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span',
    'ul', 'ol', 'li', 'a',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'div',
    'table', 'caption', 'colgroup', 'col', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'style',
    'colspan', 'rowspan', 'scope', 'width', 'height', 'align', 'valign',
    'border', 'cellpadding', 'cellspacing',
  ],
  ALLOW_DATA_ATTR: false,
});

const isProductSectionEnabled = (...values: unknown[]) => {
  const value = values.find((candidate) => candidate !== undefined && candidate !== null);
  return value === undefined || (value !== false && value !== 0 && value !== "0");
};

const setProductDetailMeta = (product: DemoProduct | null, id?: string) => {
  if (!product) {
    document.title = "Loading product - Beesee Global Technology Inc.";
    createOrUpdateMeta("robots", "noindex, follow");
    return;
  }

  const description = product.tagline ? `${product.tagline} ${product.description ?? ''}`.trim() : product.description || `Learn more about ${product.name} from Beesee Global Technology Inc.`;

  document.title = `${product.name} | Beesee Global Technology Inc.`;
  createOrUpdateMeta("description", description);
  createOrUpdateMeta("robots", "index, follow");
  if (id) createOrUpdateLink("canonical", `https://www.beesee.ph/product/${id}`);
  createOrUpdateProperty("og:title", `${product.name} | Beesee Global Technology Inc.`);
  createOrUpdateProperty("og:description", description);
  if (id) createOrUpdateProperty("og:url", `https://www.beesee.ph/product/${id}`);
  createOrUpdateProperty("og:type", "product");
  createOrUpdateMeta("twitter:card", "summary_large_image");
  createOrUpdateMeta("twitter:title", `${product.name} | Beesee Global Technology Inc.`);
  createOrUpdateMeta("twitter:description", description);
};

const currency = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(n)
    : "";

const normalizeHoverSpecs = (value: unknown): DemoProduct["hoverSpecs"] => {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return undefined;
    }
  }

  if (!Array.isArray(parsed)) return undefined;
  return parsed
    .map((item: any) => ({
      key: String(item?.key || item?.key_name || "").trim(),
      value: String(item?.value ?? item?.spec_value ?? "").trim(),
      icon: item?.icon ? String(item.icon) : undefined,
    }))
    .filter((item) => item.key && item.value);
};

const getMockHoverSpecs = (keys: unknown, detailedSpecs: unknown) => {
  if (!Array.isArray(keys) || !detailedSpecs || typeof detailedSpecs !== "object") return undefined;
  const entries = Object.entries(detailedSpecs as Record<string, Record<string, string>>)
    .flatMap(([, specs]) => Object.entries(specs || {}));
  return keys
    .map((key) => {
      const label = String(key);
      const match = entries.find(([name]) =>
        name.toLowerCase() === label.toLowerCase()
        || getIconNameForSpec(name) === getIconNameForSpec(label)
      );
      return match ? { key: match[0], value: String(match[1]) } : null;
    })
    .filter((item): item is { key: string; value: string } => Boolean(item));
};

const getYouTubeEmbedUrl = (value?: string) => {
  if (!value || typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const videoId = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com"
        ? url.pathname.startsWith("/embed/")
          ? url.pathname.split("/")[2]
          : url.searchParams.get("v") || undefined
        : undefined;
    return videoId && /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : undefined;
  } catch {
    return undefined;
  }
};

const getYouTubeId = (value?: string) => {
  const embedUrl = getYouTubeEmbedUrl(value);
  return embedUrl?.split("/").pop() || "";
};

const buildProductVariants = (specifications?: Record<string, Record<string, string>>) => {
  if (!specifications) return [];

  const values: Record<string, string> = {};
  Object.values(specifications).forEach((group) => {
    Object.entries(group || {}).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      if ((normalizedKey === "ram" || normalizedKey.includes("storage")) && value) {
        values[normalizedKey.includes("storage") ? "storage" : "ram"] = String(value);
      }
    });
  });

  const split = (value?: string) => (value || "").split(/\s*[,/|]\s*/).map((item) => item.trim()).filter(Boolean);
  const storage = split(values.storage);
  const ram = split(values.ram);
  return storage.length > 1 && storage.length === ram.length
    ? storage.map((item, index) => `${item} + ${ram[index]}`)
    : [];
};

const normalizeCategory = (value?: string) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/s$/, "");

// Older uploaded product images use #111827 as an opaque canvas. Convert only
// that near-exact blue backdrop to transparency, allowing the page black to
// show through while preserving the product artwork itself.
const useBlackMatchedProductImage = (source: string) => {
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type ParallaxSurfaceProps = {
  children: React.ReactNode;
  className: string;
  distance?: number;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

const useSectionParallax = <T extends HTMLElement>(distance = 36) => {
  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [0, 0, 0] : [distance, 0, -distance]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.985, 1, 0.99]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.78, 1, 1, 0.85]
  );

  return {
    ref,
    style: { y, scale, opacity },
  };
};

const ParallaxSection: React.FC<ParallaxSurfaceProps> = ({
  children,
  className,
  distance,
  id,
  ariaLabel,
  ariaLabelledBy,
}) => {
  const { ref, style } = useSectionParallax<HTMLElement>(distance);

  return (
    <motion.section
      ref={ref}
      className={`product-parallax-surface ${className}`}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      style={style}
    >
      {children}
    </motion.section>
  );
};

const ParallaxBlock: React.FC<ParallaxSurfaceProps> = ({
  children,
  className,
  distance,
  ariaLabel,
  ariaLabelledBy,
}) => {
  const { ref, style } = useSectionParallax<HTMLDivElement>(distance);

  return (
    <motion.div
      ref={ref}
      className={`product-parallax-surface ${className}`}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      style={style}
    >
      {children}
    </motion.div>
  );
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // State
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openInquiry, setOpenInquiry] = useState(false);
  const [isDownloadingBrochure, setIsDownloadingBrochure] = useState(false);
  const [brochureDownloadError, setBrochureDownloadError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isCompactViewport, setIsCompactViewport] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches
  );

  const handleBrochureDownload = async () => {
    if (!product?.pid || isDownloadingBrochure) return;

    setIsDownloadingBrochure(true);
    setBrochureDownloadError("");
    try {
      const brochureResponse = await axiosClient.get(
        `/ecom_products/${encodeURIComponent(product.pid)}/brochure/download`,
        { responseType: "blob" }
      );
      if (brochureResponse.status < 200 || brochureResponse.status >= 300) {
        throw new Error(`Brochure download failed with status ${brochureResponse.status}.`);
      }
      const brochureBlob = brochureResponse.data;
      const objectUrl = URL.createObjectURL(brochureBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = `${product.name}-brochure.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      console.error("Failed to prepare product brochure download", error);
      setBrochureDownloadError("Unable to prepare the brochure download. Please try again.");
    } finally {
      setIsDownloadingBrochure(false);
    }
  };

  // Carousel autoplay
  const autoplayRef = useRef<number | null>(null);
  const recommendedCarouselRef = useRef<HTMLDivElement>(null);
  const recommendedSlideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeRelatedIndexRef = useRef(0);
  const [activeRelatedIndex, setActiveRelatedIndex] = useState(0);
  const [activePhysicalRelatedIndex, setActivePhysicalRelatedIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const reduceSceneMotion = Boolean(prefersReducedMotion || isCompactViewport);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 800px)");
    const updateViewport = (event: MediaQueryListEvent | MediaQueryList) => setIsCompactViewport(event.matches);

    updateViewport(mobileViewport);
    mobileViewport.addEventListener("change", updateViewport);
    return () => mobileViewport.removeEventListener("change", updateViewport);
  }, []);

  const { scrollYProgress } = useScroll();
  const galleryImageY = useTransform(
    scrollYProgress,
    [0, 0.35],
    reduceSceneMotion ? ["0px", "0px"] : ["-12px", "12px"]
  );
  const fallbackProduct = useMemo(
    () => mockProducts.products.find((item) => item.pid.toLowerCase() === id?.toLowerCase()),
    [id]
  );
  const productVariants = useMemo(() => buildProductVariants(product?.detailedSpecs), [product?.detailedSpecs]);
  const topSpecifications = useMemo(() => {
    if (Array.isArray(product?.hoverSpecs)) {
      return product?.hoverSpecs?.slice(0, 4).map((specification) => ({
        group: "Highlights",
        label: specification.key,
        value: specification.value,
        icon: specification.icon,
      })) || [];
    }

    const specifications = product?.detailedSpecs;
    if (!specifications) return [];

    const entries = Object.entries(specifications).flatMap(([group, specs]) =>
      Object.entries(specs || {}).map(([label, value]) => ({ group, label, value: String(value) }))
    );
    const priority = ["processor", "cpu", "ram", "storage", "display", "size", "resolution", "refresh", "battery"];
    const picked = priority
      .map((needle) => entries.find((item) => item.label.toLowerCase().includes(needle)))
      .filter((item, index, items): item is NonNullable<typeof item> => Boolean(item) && items.findIndex((candidate) => candidate?.label === item?.label) === index);

    return [...picked, ...entries.filter((item) => !picked.some((pickedItem) => pickedItem.label === item.label))];
  }, [product?.detailedSpecs]);
  const specificationGroups = useMemo(
    () => Object.entries(product?.detailedSpecs || {}) as Array<[string, Record<string, string>]>,
    [product?.detailedSpecs]
  );

  // Load the live public catalogue before deriving recommendations from it.
  const { data: productInfo, isLoading: productLoading, isError: isProductError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchSpecificProductPublic(id as string),
    enabled: !!id,
    retry: false,
  });
  const { data: publicProducts } = useQuery({
    queryKey: ["public-products"],
    queryFn: fetchAllProductPublic,
    enabled: !!id,
    staleTime: 60_000,
  });

  const relatedProducts = useMemo(() => {
    if (!product?.category) return [];

    const currentCategory = normalizeCategory(product.category);
    const publicProductList = Array.isArray(publicProducts)
      ? publicProducts
      : Array.isArray(publicProducts?.data)
        ? publicProducts.data
        : [];
    const liveProducts = publicProductList.map((item: any): DemoProduct => ({
      pid: item.pid,
      name: item.name,
      tagline: item.tagline,
      category: item.category_name || item.category,
      gallery: item.image_url ? [item.image_url] : item.image ? [item.image] : item.gallery,
    }));
    const catalogue = liveProducts.length ? liveProducts : mockProducts.products;

    return catalogue
      .filter((item: DemoProduct) => item.pid !== product.pid && normalizeCategory(item.category) === currentCategory)
      .slice(0, 8);
  }, [product?.category, product?.pid, publicProducts]);
  const carouselProducts = useMemo(() => {
    if (relatedProducts.length <= 1) return relatedProducts;
    return [...relatedProducts, ...relatedProducts, ...relatedProducts];
  }, [relatedProducts]);
  const heroImage = product?.gallery?.[activeIdx] || product?.gallery?.[0] || "";
  const pageMatchedHeroImage = useBlackMatchedProductImage(heroImage);

  useEffect(() => {
    const initialIndex = relatedProducts.length > 1 ? relatedProducts.length : 0;
    activeRelatedIndexRef.current = initialIndex;
    setActivePhysicalRelatedIndex(initialIndex);
    setActiveRelatedIndex(0);
    recommendedSlideRefs.current = [];
  }, [id, relatedProducts.length]);

  useEffect(() => {
    const carousel = recommendedCarouselRef.current;
    if (!carousel || relatedProducts.length === 0) return;

    const logicalCount = relatedProducts.length;
    let scrollFrame: number | null = null;
    let pauseUntil = 0;
    let intervalId: number | null = null;
    let resetTimer: number | null = null;
    let dragPointerId: number | null = null;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let isDragging = false;
    let suppressClick = false;
    let isAutoTransitioning = false;
    let pendingLoopReset = false;
    let autoTransitionTimer: number | null = null;

    const getSlides = () => Array.from(
      carousel.querySelectorAll<HTMLElement>(".recommended-product-slide")
    );

    const centerSlide = (index: number, behavior: ScrollBehavior = "smooth") => {
      const slide = getSlides()[index];
      if (!slide) return;

      const targetLeft = slide.offsetLeft - (carousel.clientWidth - slide.offsetWidth) / 2;
      carousel.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: prefersReducedMotion ? "auto" : behavior,
      });
    };

    const normalizeIndex = (index: number) =>
      ((index % logicalCount) + logicalCount) % logicalCount;

    const recenterCarousel = (logicalIndex: number) => {
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = null;
      pendingLoopReset = false;
      isAutoTransitioning = false;
      const middleIndex = logicalCount + normalizeIndex(logicalIndex);
      activeRelatedIndexRef.current = middleIndex;
      setActivePhysicalRelatedIndex(middleIndex);
      setActiveRelatedIndex(normalizeIndex(logicalIndex));
      centerSlide(middleIndex, "auto");
    };

    const updateActiveSlide = () => {
      const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      const slides = getSlides();
      if (!slides.length) return;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - carouselCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      activeRelatedIndexRef.current = closestIndex;
      setActivePhysicalRelatedIndex(closestIndex);
      const logicalIndex = normalizeIndex(closestIndex);
      setActiveRelatedIndex(logicalIndex);

      if (
        logicalCount > 1
        && !isAutoTransitioning
        && !pendingLoopReset
        && (closestIndex < logicalCount || closestIndex >= logicalCount * 2)
      ) {
        if (resetTimer !== null) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          recenterCarousel(logicalIndex);
        }, 180);
      }
    };

    const handleScroll = () => {
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(updateActiveSlide);
    };

    const pauseForManualScroll = () => {
      pauseUntil = Date.now() + 7000;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (isAutoTransitioning) {
        isAutoTransitioning = false;
        pendingLoopReset = false;
        if (autoTransitionTimer !== null) window.clearTimeout(autoTransitionTimer);
        autoTransitionTimer = null;
      }
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScrollLeft = carousel.scrollLeft;
      isDragging = false;
      pauseForManualScroll();
      carousel.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      const distance = event.clientX - dragStartX;
      if (Math.abs(distance) > 6) isDragging = true;
      if (!isDragging) return;

      event.preventDefault();
      carousel.scrollLeft = dragStartScrollLeft - distance;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      if (isDragging) suppressClick = true;
      carousel.releasePointerCapture?.(event.pointerId);
      dragPointerId = null;
      isDragging = false;
    };

    const preventDraggedClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    };

    const finishAutoTransition = () => {
      if (autoTransitionTimer !== null) window.clearTimeout(autoTransitionTimer);
      autoTransitionTimer = null;

      if (pendingLoopReset) {
        pendingLoopReset = false;
        isAutoTransitioning = false;
        recenterCarousel(0);
        return;
      }

      isAutoTransitioning = false;
    };

    const handleScrollEnd = () => {
      if (isAutoTransitioning) finishAutoTransition();
    };

    const advanceCarousel = () => {
      if (
        isAutoTransitioning
        || pendingLoopReset
        || Date.now() < pauseUntil
        || carousel.scrollWidth <= carousel.clientWidth + 1
      ) return;

      const currentIndex = activeRelatedIndexRef.current;
      const nextIndex = currentIndex >= logicalCount * 2 - 1
        ? logicalCount * 2
        : currentIndex + 1;
      isAutoTransitioning = true;
      pendingLoopReset = nextIndex >= logicalCount * 2;
      activeRelatedIndexRef.current = nextIndex;
      setActivePhysicalRelatedIndex(nextIndex);
      setActiveRelatedIndex(normalizeIndex(nextIndex));
      centerSlide(nextIndex);

      if (autoTransitionTimer !== null) window.clearTimeout(autoTransitionTimer);
      autoTransitionTimer = window.setTimeout(finishAutoTransition, 700);
    };

    const startAutoScroll = () => {
      if (intervalId !== null) window.clearInterval(intervalId);
      intervalId = null;
      if (!prefersReducedMotion && relatedProducts.length > 1) {
        intervalId = window.setInterval(advanceCarousel, 3000);
      }
    };

    const animationFrameId = window.requestAnimationFrame(() => {
      const initialIndex = logicalCount > 1 ? logicalCount : 0;
      activeRelatedIndexRef.current = initialIndex;
      setActivePhysicalRelatedIndex(initialIndex);
      centerSlide(initialIndex, "auto");
      updateActiveSlide();
      startAutoScroll();
    });

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    carousel.addEventListener("pointerdown", pauseForManualScroll, { passive: true });
    carousel.addEventListener("wheel", pauseForManualScroll, { passive: true });
    carousel.addEventListener("pointerdown", handlePointerDown);
    carousel.addEventListener("pointermove", handlePointerMove, { passive: false });
    carousel.addEventListener("pointerup", handlePointerUp);
    carousel.addEventListener("pointercancel", handlePointerUp);
    carousel.addEventListener("click", preventDraggedClick, true);
    carousel.addEventListener("scrollend", handleScrollEnd);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
      if (intervalId !== null) window.clearInterval(intervalId);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      carousel.removeEventListener("scroll", handleScroll);
      carousel.removeEventListener("pointerdown", pauseForManualScroll);
      carousel.removeEventListener("wheel", pauseForManualScroll);
      carousel.removeEventListener("pointerdown", handlePointerDown);
      carousel.removeEventListener("pointermove", handlePointerMove);
      carousel.removeEventListener("pointerup", handlePointerUp);
      carousel.removeEventListener("pointercancel", handlePointerUp);
      carousel.removeEventListener("click", preventDraggedClick, true);
      carousel.removeEventListener("scrollend", handleScrollEnd);
      if (autoTransitionTimer !== null) window.clearTimeout(autoTransitionTimer);
    };
  }, [prefersReducedMotion, relatedProducts.length]);

  useEffect(() => {
    setSelectedVariant((current) => {
      if (!productVariants.length) return "";
      return current && productVariants.includes(current) ? current : productVariants[0];
    });
  }, [productVariants]);

  // Back to top scroll handler
  useEffect(() => {
    // Product links can update only the route parameter while this component
    // remains mounted, so reset the page whenever the viewed product changes.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Prefer the API response; only use local mock data when the API request fails.
    setLoading(Boolean(productLoading));
    const src = productInfo || (isProductError ? fallbackProduct : null);
    if (!src) {
      setProduct(null);
      return;
    }

    const source = src as any;
    const publicProductList = Array.isArray(publicProducts)
      ? publicProducts
      : Array.isArray(publicProducts?.data)
        ? publicProducts.data
        : [];
    const publicSummary = publicProductList.find((item: any) =>
      String(item?.pid || "").toLowerCase() === String(source.pid || id || "").toLowerCase()
    );
    const images = Array.isArray(source.images) ? source.images.slice().sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) : [];
    const gallery = images.length
      ? images.map((item: any) => item.image_url)
      : Array.isArray(source.gallery) && source.gallery.length
        ? source.gallery
        : source.image
          ? [source.image]
          : source.images?.image_url
            ? [source.images.image_url]
            : [];
    const videoUrl = [source.video_url, source.videoUrl, source.product_video, source.video?.video_url, source.video?.url]
      .find((value): value is string => typeof value === "string" && value.length > 0);
    const videoEmbedUrl = getYouTubeEmbedUrl(source.video_embed_url || source.videoEmbedUrl || source.video?.embed_url || videoUrl);
    const productSpecsHighlightUrl = [
      source.product_specs_highlight,
      source.productSpecsHighlight,
      publicSummary?.product_specs_highlight,
      publicSummary?.productSpecsHighlight,
    ].find((value): value is string => typeof value === "string" && value.length > 0);

    const formattedProduct: DemoProduct = {
      pid: source.pid,
      name: source.name,
      tagline: source.tagline,
      gallery: gallery.length ? gallery : undefined,
      videoUrl: videoEmbedUrl ? undefined : videoUrl,
      videoEmbedUrl,
      videoEnabled: source.video_enabled !== false && source.video_enabled !== 0 && source.video_enabled !== "0",
      brochureUrl: [source.brochure_url, source.brochureUrl, source.product_brochure]
        .find((value): value is string => typeof value === "string" && value.length > 0),
      brochureEnabled: source.brochure_enabled !== false && source.brochure_enabled !== 0 && source.brochure_enabled !== "0",
      productSpecsHighlightUrl,
      productSpecsHighlightEnabled: [
        source.product_specs_highlight_enabled,
        publicSummary?.product_specs_highlight_enabled,
      ].find((value) => value !== undefined) !== false
        && [
          source.product_specs_highlight_enabled,
          publicSummary?.product_specs_highlight_enabled,
        ].find((value) => value !== undefined) !== 0
        && [
          source.product_specs_highlight_enabled,
          publicSummary?.product_specs_highlight_enabled,
        ].find((value) => value !== undefined) !== "0",
      basicInformationEnabled: isProductSectionEnabled(
        source.basic_information_enabled,
        publicSummary?.basic_information_enabled
      ),
      detailsEnabled: isProductSectionEnabled(
        source.details_enabled,
        publicSummary?.details_enabled
      ),
      galleryEnabled: isProductSectionEnabled(
        source.gallery_enabled,
        publicSummary?.gallery_enabled
      ),
      quickProductHighlightEnabled: isProductSectionEnabled(
        source.quick_product_highlight_enabled,
        publicSummary?.quick_product_highlight_enabled
      ),
      specificationsEnabled: isProductSectionEnabled(
        source.specifications_enabled,
        publicSummary?.specifications_enabled
      ),
      price: source.price,
      description: source.description,
      details: source.details || "",
      keyFeatures: source.keyFeatures || source.key_features || [],
      detailedSpecs: source.detailed_specs || source.detailedSpecs || {},
      hoverSpecs:
        normalizeHoverSpecs(source.hover_specs || source.hoverSpecs)
        || normalizeHoverSpecs(publicSummary?.hover_specs || publicSummary?.hoverSpecs)
        || getMockHoverSpecs(source.hoverSpecs, source.detailed_specs || source.detailedSpecs),
      category: source.category_name || source.category,
      formattedPrice: currency(source.price),
      inStock: source.inStock ?? true,
    };

    setProduct(formattedProduct);

    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
      }
    };
  }, [fallbackProduct, id, isProductError, productInfo, productLoading, publicProducts]);

  useEffect(() => {
    setProductDetailMeta(product, id);
  }, [product, id]);

  // Carousel autoplay effect
  useEffect(() => {
    if (!product || !product.gallery || product.gallery.length <= 1) return;

    autoplayRef.current = window.setInterval(() => {
      setActiveIdx((s) => (s + 1) % product.gallery!.length);
    }, 5000);

    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [product]);

  const onPrev = () => {
    if (!product?.gallery) return;
    setActiveIdx((s) => (s - 1 + product.gallery!.length) % product.gallery!.length);
  };

  const onNext = () => {
    if (!product?.gallery) return;
    setActiveIdx((s) => (s + 1) % product.gallery!.length);
  };

  const openImagePreview = (index = activeIdx) => {
    setActiveIdx(index);
    setPreviewZoom(1);
    setIsImagePreviewOpen(true);
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewZoom(1);
  };

  useEffect(() => {
    if (!isImagePreviewOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeImagePreview();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImagePreviewOpen, product]);

  if (loading) {
    return (
      <div className="product-detail-page product-loading">
        <div className="loading-spinner">
          <motion.span
            className="product-loading__ring"
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="product-loading__text">Loading product...</p>
        </div>
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <div className="product-detail-page product-loading">
        <div className="loading-spinner">
          <Package size={48} color="var(--brand)" />
          <p style={{ marginTop: 16, color: "var(--text-muted)" }}>
            Product not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            style={{
              zIndex: 9998,
              background: 'linear-gradient(135deg, rgba(253, 204, 0, 0.95), rgba(255, 215, 0, 0.95))',
              border: '2px solid rgba(253, 204, 0, 0.5)',
              boxShadow: '0 8px 24px rgba(253, 204, 0, 0.4)',
              color: '#000'
            }}
            aria-label="Back to top"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="container">
        {/* Main Grid: Gallery + Info */}
        {(product.galleryEnabled !== false || product.basicInformationEnabled !== false) && (
        <ParallaxBlock
          className={`main-grid ${product.galleryEnabled === false || product.basicInformationEnabled === false ? "single-visible-section" : ""}`}
          distance={24}
        >
          {/* Media Column - Carousel */}
          {product.galleryEnabled !== false && (
            <motion.article
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="media-column"
            >
            <div className="carousel">
              <div className="carousel-stage">
                {product.gallery && product.gallery.length > 0 ? (
                  <button
                    type="button"
                    className="gallery-image-button"
                    onClick={() => openImagePreview()}
                    aria-label={`Enlarge image ${activeIdx + 1} of ${product.gallery.length}`}
                  >
                    <motion.img
                      key={`gallery-${activeIdx}`}
                      src={pageMatchedHeroImage}
                      alt={`${product.name} - Image ${activeIdx + 1}`}
                      className="carousel-image"
                      loading={activeIdx === 0 ? "eager" : "lazy"}
                      style={{ y: galleryImageY }}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                    <span className="gallery-enlarge-hint"><Maximize2 size={16} /> View image</span>
                  </button>
                ) : (
                  <div style={{ color: "var(--text-muted)" }}>No image available</div>
                )}
              </div>

              {product.gallery && product.gallery.length > 1 && (
                <div className="gallery-controls">
                  <button
                    type="button"
                    className="carousel-nav prev"
                    onClick={onPrev}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <div className="thumbnails gallery-thumbnails" aria-label="Product image previews">
                    {product.gallery.map((img, i) => (
                      <button
                        key={i}
                        className={`thumb ${i === activeIdx ? "active" : ""}`}
                        onClick={() => openImagePreview(i)}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="carousel-nav next"
                    onClick={onNext}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            </motion.article>
          )}

          {/* Info Column */}
          {product.basicInformationEnabled !== false && (
            <motion.aside
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="info-column"
            >
            <motion.div variants={fadeUp} className="info-card">
              <div className="product-eyebrow">
               {product.category || "BEESEE TECHNOLOGY"}
              </div>
              <h1 className="title">{product.name}</h1>
              <p className="tagline">{product.tagline}</p>

              {product.description && <p className="description">{product.description}</p>}
              <div className="product-meta">
                {/* <span>Model {product.pid}</span> */}
                {/* <span><ShieldCheck size={15} /> Business-ready support</span> */}
              </div>

       {/* product variant section */}

              {/* {!!product.keyFeatures?.length && (
                <div className="product-highlights">
                  <p>WHY YOU'LL LOVE IT</p>
                  <ul>
                    {product.keyFeatures.slice(0, 4).map((feature) => (
                      <li key={feature}><span />{feature}</li>
                    ))}
                  </ul>
                </div>
              )} */}

              <div className="product-actions">
                <button type="button" className="product-inquiry-button" onClick={() => setOpenInquiry(true)}>
                  <MessageCircle size={19} /> Inquire about this product
                </button>
                {/* <a href="#specifications" className="product-spec-link">
                  View specifications <ChevronRight size={18} />
                </a> */}
                {product.brochureUrl && product.brochureEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleBrochureDownload}
                      disabled={isDownloadingBrochure}
                      className="product-brochure-link"
                    >
                      <Download size={18} /> {isDownloadingBrochure ? "Preparing download..." : "Download product brochure"}
                    </button>
                    {brochureDownloadError && (
                      <span className="product-brochure-download-error" role="alert">{brochureDownloadError}</span>
                    )}
                  </>
                )}
              </div>
            </motion.div>
            </motion.aside>
          )}
        </ParallaxBlock>
        )}

        {product.quickProductHighlightEnabled !== false && topSpecifications.length > 0 && (
          <ParallaxSection
            className="top-specifications-strip"
            distance={28}
            ariaLabel={`${product.name} key specifications`}
          >
            {topSpecifications.slice(0, 4).map((specification) => {
              const configuredIcon = "icon" in specification && typeof specification.icon === "string"
                ? specification.icon
                : undefined;
              const specificationValues = String(specification.value)
                .split(/\s*\/\s*/)
                .map((value) => value.trim())
                .filter(Boolean);
              return (
                <article key={`${specification.group}-${specification.label}`} className="top-specification-item">
                  <div className="top-specification-heading">
                    <span>{specification.label}</span>
                    <LucideIcon
                      name={configuredIcon || getIconNameForSpec(specification.label)}
                      size={20}
                      aria-hidden="true"
                    />
                  </div>
                  <strong>
                    {specificationValues.map((value, index) => (
                        <span key={`${specification.label}-value-${index}`} className="top-specification-value-line">
                          {value}
                        </span>
                    ))}
                  </strong>
                </article>
              );
            })}
          </ParallaxSection>
        )}

        {product.specificationsEnabled !== false && (
        <section className="product-showcase-section" id="specifications">
          <div className="showcase-intro">
            <span>PRODUCT INFORMATION</span>
            <h2>Specifications</h2>
            {product.detailsEnabled !== false && product.details && (
              <div
                className="long-specs showcase-long-specs"
                dangerouslySetInnerHTML={{ __html: sanitizeDetails(product.details) }}
              />
            )}
          </div>

          <div className="showcase-scroll-grid">
            <div className="showcase-content-column showcase-specifications">
              {specificationGroups.length > 0 ? (
                <>
                {specificationGroups.map(([category, specs], categoryIndex) => (
                  <motion.article
                    key={category}
                    className="showcase-spec-group"
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-90px" }}
                    transition={{ duration: 0.45, delay: categoryIndex * 0.05 }}
                  >
                    <h3>{category}</h3>
                    <table aria-label={`${category} specifications`}>
                      <tbody>
                      {Object.entries(specs).map(([key, value]) => (
                        <tr key={`${category}-${key}`} className="showcase-spec-row">
                          <th scope="row">{key}</th>
                          <td>{String(value)}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </motion.article>
                ))}
                </>
              ) : (
                <div className="showcase-spec-empty">No specifications available.</div>
              )}

            </div>
          </div>
        </section>
        )}

        {product.videoEnabled && (product.videoUrl || product.videoEmbedUrl) && (
          <ParallaxSection
            className="product-video-section"
            distance={42}
            ariaLabelledBy="product-video-title"
          >
            <div className="product-video-copy">
              <h2 id="product-video-title">See {product.name} in action</h2>
              <p>Watch a short product overview and see the key features in use.</p>
            </div>
            <div className="product-video-player">
              {product.videoEmbedUrl ? (
                <iframe
                  src={`${product.videoEmbedUrl}${product.videoEmbedUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeId(product.videoEmbedUrl)}`}
                  title={`${product.name} YouTube video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video autoPlay muted loop playsInline preload="metadata" poster={heroImage}>
                  <source src={product.videoUrl} />
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          </ParallaxSection>
        )}

        {product.productSpecsHighlightUrl && product.productSpecsHighlightEnabled && (
          <ParallaxSection
            className="product-specs-highlight-section"
            distance={34}
            ariaLabel={`${product.name} specification highlights`}
          >
            <img
              src={product.productSpecsHighlightUrl}
              alt={`${product.name} specification highlights`}
              loading="lazy"
            />
          </ParallaxSection>
        )}

        {/* Specifications Section */}
        {/* <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="specs-section"
          id="specifications"
        >
          <div className="section-heading">
            <span>PRODUCT INFORMATION</span>
            <h2 className="section-title">Specifications</h2>
          </div>

          <div className="specs-table-container">
            {product.detailedSpecs ? (
              <div className="specs-table-clean">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.detailedSpecs).map(([category, specs], catIdx) => (
                      <React.Fragment key={category}> */}
                        {/* Category Header with separators */} 
                        {/* <tr>
                          <td colSpan={2} style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000000', letterSpacing: '0.5px' }}>
                            {category}
                          </td>
                        </tr>  */}

                        {/* Spec rows */}
                        {/* {Object.entries(specs).map(([key, value], index) => (
                          <tr key={`${category}-${index}`} className="spec-row-clean">
                            <td className="spec-label-clean">
                              <strong>{key}</strong>
                            </td>
                            <td className="spec-value-clean">{value}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-specs">
                <p>No specifications available.</p>
              </div>
            )}
          </div>
        </motion.section> */}

        <ParallaxSection
          className="product-inquiry-section"
          distance={34}
        >
          <div>
            <span>LET'S FIND THE RIGHT FIT</span>
            <h2>Interested in {product.name}?</h2>
            <p>Tell us what you need and our specialists will contact you by email with the right solution.</p>
          </div>
          <button type="button" className="product-inquiry-button" onClick={() => setOpenInquiry(true)}>
            <MessageCircle size={19} /> inquire about this product
          </button>
        </ParallaxSection>

        {relatedProducts.length > 0 && (
          <ParallaxSection
            className="recommended-products-section"
            distance={30}
            ariaLabelledBy="recommended-products-title"
          >
            <div className="recommended-products-heading">
              <span>EXPLORE MORE</span>
              <h2 id="recommended-products-title">{product.category}</h2>
            </div>
            <motion.div
              ref={recommendedCarouselRef}
              className="recommended-products-carousel"
              aria-label={`More ${product.category} products`}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
            >
              {carouselProducts.map((related: DemoProduct, index: number) => (
                <motion.div
                  key={`${related.pid}-${index}`}
                  ref={(node) => { recommendedSlideRefs.current[index] = node; }}
                  className={`recommended-product-slide${(
                    isCompactViewport
                      ? activePhysicalRelatedIndex === index
                      : activeRelatedIndex === index % Math.max(relatedProducts.length, 1)
                  ) ? " is-active" : ""}${(
                    isCompactViewport
                    && (index === activePhysicalRelatedIndex - 1 || index === activePhysicalRelatedIndex + 1)
                  ) ? " is-adjacent" : ""}`}
                  aria-hidden={index < relatedProducts.length || index >= relatedProducts.length * 2 ? true : undefined}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.38, delay: prefersReducedMotion ? 0 : index * 0.08, ease: "easeOut" }}
                >
                  <Link
                    to={`/product/${related.pid}`}
                    className="recommended-product-card"
                    tabIndex={index < relatedProducts.length || index >= relatedProducts.length * 2 ? -1 : undefined}
                  >
                    <div className="recommended-product-image">
                      <img src={related.gallery?.[0]} alt={related.name} loading="lazy" />
                    </div>
                    <div className="recommended-product-copy">
                      <span>{related.category}</span>
                      <h3>{related.name}</h3>
                      <p>{related.tagline}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </ParallaxSection>
        )}

        {/* Checkout Modal */}
        <Suspense fallback={null}>
          <CheckoutModal
            isOpen={openCheckout}
            onClose={() => setOpenCheckout(false)}
            product={product}
          />
        </Suspense>
        <ProductInquiryModal
          open={openInquiry}
          productName={product.name}
          productPid={product.pid}
          selectedVariant={selectedVariant}
          onClose={() => setOpenInquiry(false)}
        />

        <button
          type="button"
          className="mobile-sticky-inquiry-button"
          onClick={() => setOpenInquiry(true)}
        >
          <MessageCircle size={19} /> Inquire about this product
        </button>
      </div>

      {isImagePreviewOpen && heroImage && (
        <div className="product-image-modal" role="dialog" aria-modal="true" aria-label={`${product.name} image preview`} onClick={closeImagePreview}>
          <div className="product-image-modal__toolbar" onClick={(event) => event.stopPropagation()}>
            <span>{activeIdx + 1} / {product.gallery?.length || 1}</span>
            <div>
              <button type="button" onClick={() => setPreviewZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))} disabled={previewZoom <= 1} aria-label="Zoom out"><ZoomOut size={19} /></button>
              <button type="button" onClick={() => setPreviewZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))} disabled={previewZoom >= 3} aria-label="Zoom in"><ZoomIn size={19} /></button>
              <button type="button" onClick={closeImagePreview} aria-label="Close image preview"><X size={21} /></button>
            </div>
          </div>
          <div className="product-image-modal__canvas" onClick={(event) => event.stopPropagation()} onWheel={(event) => { event.preventDefault(); setPreviewZoom((value) => Math.min(3, Math.max(1, Number((value + (event.deltaY < 0 ? 0.2 : -0.2)).toFixed(2))))); }}>
            {product.gallery && product.gallery.length > 1 && <button type="button" className="product-image-modal__nav product-image-modal__nav--previous" onClick={onPrev} aria-label="Previous image"><ChevronLeft size={25} /></button>}
            <img src={pageMatchedHeroImage} alt={`${product.name} enlarged image ${activeIdx + 1}`} style={{ transform: `scale(${previewZoom})` }} />
            {product.gallery && product.gallery.length > 1 && <button type="button" className="product-image-modal__nav product-image-modal__nav--next" onClick={onNext} aria-label="Next image"><ChevronRight size={25} /></button>}
          </div>
          <p className="product-image-modal__hint">Use the controls or mouse wheel to zoom. Press Esc to close.</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
