import React, { useEffect, useMemo, useState, useRef, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowLeft, ArrowUp, ChevronRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { fetchSpecificProductPublic } from '../../src/services/Ecommerce/productServices'
import { useQuery } from "@tanstack/react-query";
import mockProducts from "../../src/data/mockProductData.json";
import ProductInquiryModal from "./ProductInquiryModal";

// Lazy load the checkout modal for better performance
const CheckoutModal = lazy(() => import("../../src/pages/HomePagesPage/ProductDetails/components/CheckoutModal"));

// @ts-ignore: CSS module import declaration not available in this project setup
import "./productDetails.css";

// Import your mock data
// mock data removed — rely on API via react-query

type DemoProduct = {
  pid: string;
  name: string;
  tagline?: string;
  gallery?: string[];
  price?: number;
  description?: string;
  keyFeatures?: string[];
  detailedSpecs?: Record<string, Record<string, string>>;
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openInquiry, setOpenInquiry] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");

  // Carousel autoplay
  const autoplayRef = useRef<number | null>(null);
  const fallbackProduct = useMemo(
    () => mockProducts.products.find((item: any) => item.pid.toLowerCase() === id?.toLowerCase()),
    [id]
  );
  const productVariants = useMemo(() => buildProductVariants(product?.detailedSpecs), [product?.detailedSpecs]);

  useEffect(() => {
    setSelectedVariant((current) => {
      if (!productVariants.length) return "";
      return current && productVariants.includes(current) ? current : productVariants[0];
    });
  }, [productVariants]);

  // The local catalogue is the reliable source for the public product routes.
  // Do not request the API for these entries while its public endpoint is unavailable.
  const { data: productInfo, isLoading: productLoading, isError: isProductError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchSpecificProductPublic(id as string),
    enabled: !!id && !fallbackProduct,
    retry: false,
  });

  // Back to top scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Prefer the API when it is available; otherwise use the bundled catalogue.
    setLoading(!fallbackProduct && Boolean(productLoading));
    const src = productInfo || fallbackProduct;
    if (!src) {
      setProduct(null);
      return;
    }

    const source = src as any;
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

    const formattedProduct: DemoProduct = {
      pid: source.pid,
      name: source.name,
      tagline: source.tagline,
      gallery: gallery.length ? gallery : undefined,
      price: source.price,
      description: source.description,
      keyFeatures: source.keyFeatures || source.key_features || [],
      detailedSpecs: source.detailed_specs || source.detailedSpecs || {},
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
  }, [fallbackProduct, productInfo, productLoading]);

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

  if (loading) {
    return (
      <div className="product-detail-page product-loading">
        <div className="loading-spinner">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Package size={48} color="var(--brand)" />
          </motion.div>
          <p style={{ marginTop: 16, color: "var(--text-muted)" }}>Loading product...</p>
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
          <button
            type="button"
            className="beesee-button beesee-button--small"
            onClick={() => navigate("/products")}
          >
            Back to Products
          </button>
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

      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="container">
          <div className="nav-content">
            <button
              type="button"
              className="beesee-button beesee-button--small inline-flex items-center gap-2"
              onClick={() => navigate("/products")}
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
              Back to Products
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Main Grid: Gallery + Info */}
        <div className="main-grid">
          {/* Media Column - Carousel */}
          <motion.article
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="media-column"
          >
            <div className="carousel">
              <div className="carousel-stage">
                {product.gallery && product.gallery.length > 0 ? (
                  <img
                    src={product.gallery[activeIdx]}
                    alt={`${product.name} - Image ${activeIdx + 1}`}
                    className="carousel-image"
                    loading={activeIdx === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <div style={{ color: "var(--text-muted)" }}>No image available</div>
                )}
              </div>

              {product.gallery && product.gallery.length > 1 && (
                <>
                  <button
                    className="carousel-nav prev"
                    onClick={onPrev}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-nav next"
                    onClick={onNext}
                    aria-label="Next image"
                  >
                    ›
                  </button>

                  <div className="thumbnails">
                    {product.gallery.map((img, i) => (
                      <button
                        key={i}
                        className={`thumb ${i === activeIdx ? "active" : ""}`}
                        onClick={() => setActiveIdx(i)}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.article>

          {/* Info Column */}
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
                <span>Model {product.pid}</span>
                {/* <span><ShieldCheck size={15} /> Business-ready support</span> */}
              </div>

              {productVariants.length > 0 && (
                <div className="product-variants">
                  <p>AVAILABLE VARIANTS</p>
                  <div className="product-variant-options" aria-label="Available product variants">
                    {productVariants.map((variant, index) => (
                      <button
                        type="button"
                        key={variant}
                        className={selectedVariant === variant || (!selectedVariant && index === 0) ? "is-selected" : ""}
                        onClick={() => setSelectedVariant(variant)}
                        aria-pressed={selectedVariant === variant || (!selectedVariant && index === 0)}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!!product.keyFeatures?.length && (
                <div className="product-highlights">
                  <p>WHY YOU'LL LOVE IT</p>
                  <ul>
                    {product.keyFeatures.slice(0, 4).map((feature) => (
                      <li key={feature}><span />{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="product-actions">
                <button type="button" className="product-inquiry-button" onClick={() => setOpenInquiry(true)}>
                  <MessageCircle size={19} /> Inquire about this product
                </button>
   
              </div>
            </motion.div>
          </motion.aside>
        </div>

        {/* Specifications Section */}
        <motion.section
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
                      <React.Fragment key={category}>
                        {/* Category Header with separators */} 
                        <tr>
                          <td colSpan={2} style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#000000', letterSpacing: '0.5px' }}>
                            {category}
                          </td>
                        </tr> 

                        {/* Spec rows */}
                        {Object.entries(specs).map(([key, value], index) => (
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
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="product-inquiry-section"
        >
          <div>
            <span>LET'S FIND THE RIGHT FIT</span>
            <h2>Interested in {product.name}?</h2>
            <p>Tell us what you need and our specialists will contact you by email with the right solution.</p>
          </div>
          <button type="button" className="product-inquiry-button" onClick={() => setOpenInquiry(true)}>
            <MessageCircle size={19} /> Start an inquiry
          </button>
        </motion.section>

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
      </div>
    </div>
  );
};

export default ProductDetail;
