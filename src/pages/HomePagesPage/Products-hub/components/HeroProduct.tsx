"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../../../../assets/css/featuredProduct.css";
import "../../../../assets/css/global.css";
import { useNavigate } from "react-router-dom";

export default function ProductShowcase() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only add mouse tracking on desktop
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        setMousePosition({ x, y });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isMobile]);

  if (!mounted) return null;

  // For mobile: use static content with no animations
  if (isMobile) {
    return (
      <div className="featured-showcase-optimized hero-wrapper-no-clip">
        <div className="featured-content-optimized safe-container">
          
          {/* LEFT SECTION - Static on mobile */}
          <div className="watches-stage-optimized">
            <div className="floor-glow-simple" />

            <div className="floating-particles">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="floating-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${15 + Math.random() * 10}s`
                  }}
                />
              ))}
            </div>

            {/* PRODUCT 1 - Static */}
            <div className="watch-item-optimized watch-red-optimized">
              <img src="/assets/images/featuredProduct/laptop1.png"
                   alt="Laptop Model X"
                   className="watch-img-optimized" />
              <div className="data-badge badge-1">144Hz</div>
              <div className="data-badge badge-2">RTX</div>
              <div className="data-badge badge-3">4.9★</div>
            </div>

            {/* PRODUCT 2 - Static */}
            <div className="watch-item-optimized watch-green-optimized">
              <img src="/assets/images/featuredProduct/laptop2.png"
                   alt="Laptop Model Pro"
                   className="watch-img-optimized" />
              <div className="data-badge badge-4">Ryzen 7</div>
              <div className="data-badge badge-5">TURBO MODE</div>
              <div className="data-badge badge-6">99% EF</div>
            </div>

            <div className="orbital-ring ring-1" />
            <div className="orbital-ring ring-2" />
          </div>

          {/* RIGHT CONTENT - Static on mobile */}
          <div className="text-content-optimized">
            <h1 className="featured-title-optimized single-line-title bee-title-md">
              FEATURED PRODUCTS
            </h1>

            <p className="featured-description-optimized bee-body">
               The ultra-slim chassis houses a long-life battery system calibrated for extended uptime without performance throttling. With optimized hardware acceleration and modern connectivity support, the device is built to meet the requirements of power users, professionals, and performance-driven environments.
            </p>

            <div className="cta-wrapper-optimized" />

            <div className="tech-stats-optimized">
              <div className="stat-item-optimized">
                <span className="stat-value-optimized bee-title-sm">14-CORE</span>
                <span className="stat-label-optimized bee-body-sm">CPU POWER</span>
              </div>
              <div className="stat-item-optimized">
                <span className="stat-value-optimized bee-title-sm">ALL-DAY</span>
                <span className="stat-label-optimized bee-body-sm">BATTERY LIFE</span>
              </div>
              <div className="stat-item-optimized">
                <span className="stat-value-optimized bee-title-sm">ULTRA-SLIM</span>
                <span className="stat-label-optimized bee-body-sm">DESIGN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For desktop: use animations
  return (
    <div className="featured-showcase-optimized hero-wrapper-no-clip">
      <div className="featured-content-optimized safe-container">

        {/* LEFT SECTION - With animations on desktop */}
        <motion.div
          className="watches-stage-optimized"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          style={{
            transform: `translateX(${mousePosition.x * 0.3}px)
                        translateY(${mousePosition.y * 0.3}px)`
          }}
        >
          <div className="floor-glow-simple" />

          <div className="floating-particles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="floating-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>

          {/* PRODUCT 1 */}
          <motion.div
            className="watch-item-optimized watch-red-optimized"
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 1.2 }}
            whileHover={{ scale: 1.05, rotate: -5 }}
          >
            <img src="/assets/images/featuredProduct/laptop1.png"
                 alt="Laptop Model X"
                 className="watch-img-optimized" />
            <div className="data-badge badge-1">144Hz</div>
            <div className="data-badge badge-2">RTX</div>
            <div className="data-badge badge-3">4.9★</div>
          </motion.div>

          {/* PRODUCT 2 */}
          <motion.div
            className="watch-item-optimized watch-green-optimized"
            initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 15 }}
          >
            <img src="/assets/images/featuredProduct/laptop2.png"
                 alt="Laptop Model Pro"
                 className="watch-img-optimized" />
            <div className="data-badge badge-4">Ryzen 7</div>
            <div className="data-badge badge-5">TURBO MODE</div>
            <div className="data-badge badge-6">99% EF</div>
          </motion.div>

          <div className="orbital-ring ring-1" />
          <div className="orbital-ring ring-2" />
        </motion.div>

        {/* RIGHT CONTENT - With animations on desktop */}
        <motion.div
          className="text-content-optimized"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="featured-title-optimized single-line-title bee-title-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            FEATURED PRODUCTS
          </motion.h1>

          <motion.p
            className="featured-description-optimized bee-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            The ultra-slim chassis houses a long-life battery system calibrated for extended uptime without performance throttling. With optimized hardware acceleration and modern connectivity support, the device is built to meet the requirements of power users, professionals, and performance-driven environments.
          </motion.p>

          <motion.div className="cta-wrapper-optimized" />

          <motion.div
            className="tech-stats-optimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="stat-item-optimized">
              <span className="stat-value-optimized bee-title-sm">14-CORE</span>
              <span className="stat-label-optimized bee-body-sm">CPU POWER</span>
            </div>
            <div className="stat-item-optimized">
              <span className="stat-value-optimized bee-title-sm">ALL-DAY</span>
              <span className="stat-label-optimized bee-body-sm">BATTERY LIFE</span>
            </div>
            <div className="stat-item-optimized">
              <span className="stat-value-optimized bee-title-sm">ULTRA-SLIM</span>
              <span className="stat-label-optimized bee-body-sm">DESIGN</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}