import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Snackbar from "../../../components/feedback/Snackbar";
import { AlertColor } from "@mui/material/Alert";
import { fetchByPidPublic } from "../../../services/productServices";
import InquirerModal from "./components/CheckoutModal";

import "../../../assets/css/Product.css";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeImg, setActiveImg] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [snackBarType, setSnackBarType] = useState<AlertColor>("success");

  const handleShowSnackbar = (type: AlertColor, msg: string) => {
    setSnackBarType(type);
    setMessage(msg);
    setShowAlert(true);
  };

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchByPidPublic(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="product-detail-loading">
        Loading product details...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="product-detail-error">
        Failed to load product details.
      </div>
    );
  }

  const gallery = product?.gallery ?? [];
  const specs = product?.specs ?? {};

  return (
    <div className="product-detail-root">
      {/* Modal + Snackbar */}
      <InquirerModal
        open={openModal}
        device_id={id ?? ""}
        onShowSnackbar={handleShowSnackbar}
        onClose={() => setOpenModal(false)}
      />
      <Snackbar
        open={showAlert}
        type={snackBarType}
        message={message}
        onClose={() => setShowAlert(false)}
      />

      {/* Hero Gallery Section */}
      <section className="product-detail-hero">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="product-detail-hero-info"
        >
          <p className="product-detail-badge">PERFORMANCE SERIES</p>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-tagline">{product.tagline}</p>

          <div className="product-detail-actions">
            <button
              className="primary-cta"
              onClick={() => setOpenModal(true)}
            >
              Inquire Now
            </button>
            <p className="product-detail-helper">
              Save this device to keep your short-listed configurations in one
              place and return anytime to continue comparing.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="product-detail-gallery"
        >
          {gallery.length > 0 && (
            <div className="product-detail-main-image-wrapper">
              <img
                src={gallery[activeImg]}
                alt={product.name}
                className="product-detail-main-image"
                loading="lazy"
              />
              <div className="product-detail-main-glow" />
            </div>
          )}

          {gallery.length > 0 && (
            <div className="product-detail-thumbnails">
              {gallery.map((img: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  className={`product-detail-thumbnail-btn ${
                    idx === activeImg ? "is-active" : ""
                  }`}
                  onClick={() => setActiveImg(idx)}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="product-detail-thumbnail-img"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* Specs Section */}
      <section className="product-specs-section">
        <h2 className="section-title">Specifications</h2>
        <div className="product-specs-groups">
          {Object.entries(specs).map(([category, specification]) => (
            <div key={category} className="product-specs-group">
              <h3 className="product-specs-heading">{category}</h3>
              <div className="product-specs-grid">
                {Object.entries(specification as Record<string, string>).map(
                  ([key, value], index) => (
                    <motion.div
                      key={key}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="product-specs-item"
                    >
                      <span className="product-specs-label">{key}</span>
                      <span className="product-specs-value">{value}</span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlight Section */}
      <section className="product-highlight-section">
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="product-highlight-title"
        >
          Innovation that{" "}
          <span className="product-highlight-gradient">fits your life.</span>
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="product-highlight-text"
        >
          With seamless performance, intelligent features, and a bold aesthetic,
          {` ${product.name} `}moves with you—from work sessions to game nights
          and everything in between.
        </motion.p>
      </section>
    </div>
  );
};

export default ProductDetail;
