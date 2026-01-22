import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowLeft, ArrowUp } from "lucide-react";

// Lazy load the checkout modal for better performance
const CheckoutModal = lazy(() => import("./components/CheckoutModal"));

import "../../../assets/css/productDetails.css";

// Import your mock data
import mockProductData from "../../../data/mockProductData.json";

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

const currency = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }).format(n)
    : "";

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
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Carousel autoplay
  const autoplayRef = useRef<number | null>(null);

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
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // API-ready: Try fetching from backend first
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Continue to mock data
      }

      // Use mock data from your JSON file
      const foundProduct = mockProductData.products.find((p) => p.pid === id);
      
      if (foundProduct) {
        // Get category info
        const category = mockProductData.categories.find(c => c.id === foundProduct.category);
        
        // Format product data
        const formattedProduct: DemoProduct = {
          pid: foundProduct.pid,
          name: foundProduct.name,
          tagline: foundProduct.tagline,
          gallery: foundProduct.gallery || [foundProduct.image],
          price: foundProduct.price,
          description: foundProduct.description,
          keyFeatures: foundProduct.keyFeatures,
          detailedSpecs: foundProduct.detailedSpecs,
          category: category?.name || foundProduct.category,
          formattedPrice: currency(foundProduct.price),
          inStock: true,
        };
        
        setProduct(formattedProduct);
      } else {
        // Fallback to first product if not found
        const fallbackProduct = mockProductData.products[0];
        const fallbackCategory = mockProductData.categories.find(c => c.id === fallbackProduct.category);
        
        const formattedProduct: DemoProduct = {
          pid: fallbackProduct.pid,
          name: fallbackProduct.name,
          tagline: fallbackProduct.tagline,
          gallery: fallbackProduct.gallery || [fallbackProduct.image],
          price: fallbackProduct.price,
          description: fallbackProduct.description,
          keyFeatures: fallbackProduct.keyFeatures,
          detailedSpecs: fallbackProduct.detailedSpecs,
          category: fallbackCategory?.name || fallbackProduct.category,
          formattedPrice: currency(fallbackProduct.price),
          inStock: true,
        };
        
        setProduct(formattedProduct);
      }
      
      setLoading(false);
    };

    fetchProduct();

    return () => {
      if (autoplayRef.current) {
        window.clearInterval(autoplayRef.current);
      }
    };
  }, [id]);

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

  if (loading || !product) {
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
              <h1 className="title">{product.name}</h1>
              <p className="tagline">{product.tagline}</p>

              {product.description && <p className="description">{product.description}</p>}


              {/* Price Section */}
              <div className="price-section mt-6">
                <div className="price-label">Price</div>
                <div className="price">{product.formattedPrice || currency(product.price)}</div>
                <button 
                  className="beesee-button buy-button" 
                  onClick={() => setOpenCheckout(true)}
                  disabled={product.inStock === false}
                  style={{ zIndex: 1000, position: 'relative' }}
                >
                  {product.inStock === false ? "Out of Stock" : "Buy Now"}
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
        >
          <h2 className="section-title">COMPLETE SPECIFICATIONS</h2>

          <div className="specs-table-container">
            {product.detailedSpecs ? (
              <div className="specs-table-clean">
                <table className="specs-table">
                  <tbody>
                    {Object.entries(product.detailedSpecs).map(([category, specs]) => (
                      <React.Fragment key={category}>
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

        {/* Checkout Modal */}
        <Suspense fallback={null}>
          <CheckoutModal
            isOpen={openCheckout}
            onClose={() => setOpenCheckout(false)}
            product={product}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default ProductDetail;