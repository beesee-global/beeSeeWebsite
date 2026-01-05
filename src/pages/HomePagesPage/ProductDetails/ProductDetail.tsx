// ProductDetail.tsx - Complete Version with Simple Table Specs
import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Check,
  Zap,
} from "lucide-react";

// Lazy load the checkout modal for better performance
const CheckoutModal = lazy(() => import("./components/CheckoutModal"));

import "../../../assets/css/productDetails.css";

type ProductSpecs = {
  [category: string]: { [key: string]: string } | string;
};

type DemoProduct = {
  pid: string;
  name: string;
  tagline?: string;
  gallery?: string[];
  price?: number;
  description?: string;
  specs?: ProductSpecs;
  keyFeatures?: string[];
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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [openCheckout, setOpenCheckout] = useState(false);

  // Carousel autoplay
  const autoplayRef = useRef<number | null>(null);

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
        // Continue to demo data
      }

      // DEMO DATA - Complete specifications
      const demoImages = [
        "/assets/images/productHub/p1.png",
        "/assets/images/productHub/p2.png",
        "/assets/images/productHub/p3.png",
        "/assets/images/productHub/p4.png",
        "/assets/images/productHub/p5.png",
        "/assets/images/productHub/p6.png",
      ];

      const demoProducts: DemoProduct[] = [
        {
          pid: "P1001",
          name: "Beesee Laptop X1 Pro",
          tagline: "Unleash your creativity with professional-grade performance",
          gallery: [demoImages[0], demoImages[1], demoImages[2]],
          price: 79999,
          description:
            "The ultimate powerhouse for creators, developers, and professionals. Featuring cutting-edge processors, stunning display technology, and all-day battery life in an elegantly crafted aluminum chassis.",
          keyFeatures: [
            "12th Gen Intel Core i7 processor",
            "32GB DDR5 RAM for seamless multitasking",
            "1TB NVMe SSD with lightning-fast speeds",
            "NVIDIA RTX 4070 for professional graphics",
            "16-inch 4K OLED display with 100% DCI-P3",
            "Up to 12 hours battery life",
          ],
          specs: {
            Performance: {
              Processor: "Intel Core i7-12700H (14-core, up to 4.7GHz)",
              RAM: "32GB DDR5 4800MHz (upgradeable to 64GB)",
              Graphics: "NVIDIA GeForce RTX 4070 8GB GDDR6",
              Storage: "1TB M.2 NVMe PCIe 4.0 SSD",
              "Thermal System": "Dual-fan cooling with vapor chamber",
            },
            Display: {
              Size: '16" diagonal',
              Resolution: "3840 × 2400 (4K UHD+)",
              Technology: "OLED with HDR600",
              "Color Gamut": "100% DCI-P3, 100% sRGB",
              "Refresh Rate": "60Hz",
              "Touch Support": "10-point multi-touch",
              "Brightness": "400 nits typical, 600 nits peak (HDR)",
            },
            Battery: {
              Capacity: "99.9Wh lithium-polymer",
              "Battery Life": "Up to 12 hours (typical usage)",
              Charging: "140W USB-C fast charging",
              "Charge Time": "0-50% in 30 minutes",
            },
            Connectivity: {
              WiFi: "Wi-Fi 6E (802.11ax)",
              Bluetooth: "Bluetooth 5.3",
              Ports:
                "2× Thunderbolt 4, 2× USB-A 3.2, HDMI 2.1, 3.5mm audio, SD card reader",
              Webcam: "1080p FHD with privacy shutter",
              Audio: "Quad speakers with Dolby Atmos",
            },
            Dimensions: {
              Weight: "2.1 kg (4.6 lbs)",
              Dimensions: "35.7 × 24.8 × 1.79 cm",
              Material: "CNC-machined aluminum unibody",
              Colors: "Space Gray, Silver",
            },
            "Operating System": {
              OS: "Windows 11 Pro",
              "Pre-installed": "Microsoft Office Trial, Antivirus",
            },
            Package: {
              "In the Box":
                "Laptop, 140W USB-C charger, USB-C cable, Quick start guide, Warranty card",
            },
            Warranty: {
              Duration: "2-year limited warranty",
              Support: "24/7 customer support",
              "Extended Options": "Available for purchase",
            },
          },
        },
        {
          pid: "P1002",
          name: "Beesee Ultra Display 32",
          tagline: "Professional 4K monitor for creators and gamers",
          gallery: [demoImages[3], demoImages[4]],
          price: 24999,
          description:
            "Immerse yourself in stunning visuals with our flagship 32-inch 4K display. Perfect for content creation, gaming, and professional work with HDR support and ultra-wide color gamut.",
          keyFeatures: [
            "32-inch 4K UHD resolution",
            "HDR10 support with 600 nits brightness",
            "99% Adobe RGB color accuracy",
            "144Hz refresh rate for smooth gaming",
            "USB-C with 90W power delivery",
            "Ergonomic stand with height adjustment",
          ],
          specs: {
            Display: {
              Size: '32" diagonal',
              Resolution: "3840 × 2160 (4K UHD)",
              "Panel Type": "IPS with Quantum Dot",
              "Aspect Ratio": "16:9",
              "Refresh Rate": "144Hz (overclockable to 165Hz)",
              "Response Time": "1ms (MPRT)",
              HDR: "HDR10, DisplayHDR 600 certified",
            },
            "Color & Brightness": {
              "Color Gamut": "99% Adobe RGB, 95% DCI-P3",
              "Color Depth": "10-bit (1.07 billion colors)",
              Brightness: "400 nits typical, 600 nits peak",
              "Contrast Ratio": "1000:1 native, 3000:1 dynamic",
            },
            Connectivity: {
              Ports: "2× HDMI 2.1, DisplayPort 1.4, USB-C (DP Alt Mode)",
              "USB Hub": "4× USB 3.2 downstream ports",
              "Power Delivery": "90W via USB-C",
              Audio: "3.5mm audio out, built-in 5W speakers",
            },
            Features: {
              "Adaptive Sync": "AMD FreeSync Premium Pro, G-SYNC Compatible",
              "Blue Light": "Low blue light mode",
              "Flicker-Free": "Yes",
              "Picture Modes": "sRGB, Adobe RGB, DCI-P3, Gaming, Movie",
              OSD: "On-screen joystick control",
            },
            Dimensions: {
              "With Stand": "71.4 × 52.3 × 23.5 cm",
              "Without Stand": "71.4 × 42.1 × 5.8 cm",
              Weight: "8.2 kg (with stand)",
              "VESA Mount": "100 × 100mm compatible",
            },
            "Ergonomics & Stand": {
              Height: "0-130mm adjustment",
              Tilt: "-5° to 20°",
              Swivel: "±30°",
              Pivot: "90° (portrait mode)",
            },
            Package: {
              "In the Box":
                "Monitor, Adjustable stand, Power cable, HDMI cable, USB-C cable, Quick setup guide",
            },
            Warranty: {
              Duration: "3-year limited warranty",
              "Dead Pixel": "Zero bright pixel guarantee",
              Support: "Email and phone support",
            },
          },
        },
      ];

      const found = demoProducts.find((p) => p.pid === id) || demoProducts[0];
      setProduct(found);
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
      setActiveIdx((s) => (s + 1) % (product?.gallery?.length ?? 1));
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

  const specSections = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="product-detail-page">
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
            variants={staggerContainer}
            className="info-column"
          >
            <motion.div variants={fadeUp} className="info-card">
              <span className="badge">
                <Zap size={14} />
                Premium Series
              </span>

              <h1 className="title">{product.name}</h1>
              <p className="tagline">{product.tagline}</p>

              {product.description && <p className="description">{product.description}</p>}

              {/* Key Features */}
              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="key-features">
                  <h3 className="key-features-title">Key Features</h3>
                  <div className="features-grid">
                    {product.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <Check size={16} className="feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Section - Commented out for now
              <div className="price-section">
                <div className="price-label">Price</div>
                <div className="price">{currency(product.price)}</div>
                <button className="buy-button" onClick={() => setOpenCheckout(true)}>
                  Buy Now
                </button>
              </div>
              */}
            </motion.div>
          </motion.aside>
        </div>

        {/* Full Specifications - Simple Table Layout */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="specs-section"
        >
          <h2 className="section-title">Complete Specifications</h2>

          <div className="specs-table-container">
            <table className="specs-table">
              <tbody>
                {specSections.map(([category, content]) => {
                  const entries =
                    typeof content === "string" ? [[category, content]] : Object.entries(content);

                  return (
                    <React.Fragment key={category}>
                      {entries.map(([key, value], idx) => (
                        <tr key={`${category}-${idx}`}>
                          <td className="spec-label">{key}</td>
                          <td className="spec-value">{value}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Checkout Modal */}
        <Suspense fallback={null}>
          <CheckoutModal
            open={openCheckout}
            product={product}
            onClose={() => setOpenCheckout(false)}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default ProductDetail;