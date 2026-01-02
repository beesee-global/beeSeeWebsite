"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import "../../../../assets/css/featuredProduct.css";
import { useNavigate } from "react-router-dom";  

export default function ProductShowcase() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div className="featured-showcase-optimized">
      {/* Main Content */}
      <div className="featured-content-optimized">
        {/* LEFT - Watches */}
        <motion.div
          className="watches-stage-optimized"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3}px)`
          }}
        >
          {/* Floor Glow */}
          <div className="floor-glow-simple" />

          {/* Enhanced Floating Particles */}
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

          {/* Red Watch with enhanced floating */}
          <motion.div
            className="watch-item-optimized watch-red-optimized"
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05, rotate: -5 }}
            style={{
              transform: `rotate(-8deg) translateX(${mousePosition.x * 0.5}px) translateY(${mousePosition.y * 0.5}px)`
            }}
          >
            <img
              src="/assets/images/featuredProduct/p1.png"
              alt="Red Smart Watch"
              className="watch-img-optimized"
              loading="lazy"
            />
            <div className="data-badge badge-1">FPS: 60</div>
            <div className="data-badge badge-2">SYNC</div>
            <div className="data-badge badge-3">4.8★</div>
          </motion.div>

          {/* Green Watch with enhanced floating */}
          <motion.div
            className="watch-item-optimized watch-green-optimized"
            initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 12 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            whileHover={{ scale: 1.05, rotate: 15 }}
            style={{
              transform: `rotate(12deg) translateX(${mousePosition.x * 0.4}px) translateY(${mousePosition.y * 0.4}px)`
            }}
          >
            <img
              src="/assets/images/featuredProduct/p6.png"
              alt="Green Smart Watch"
              className="watch-img-optimized"
              loading="lazy"
            />
            <div className="data-badge badge-4">HR: 72</div>
            <div className="data-badge badge-5">ACTIVE</div>
            <div className="data-badge badge-6">98%</div>
          </motion.div>

          {/* Enhanced Orbital rings with DE9F00 color */}
          <div className="orbital-ring ring-1" />
          <div className="orbital-ring ring-2" />
          <div className="orbital-ring ring-3" />
        </motion.div>

        {/* RIGHT - Text Content */}
        <motion.div
          className="text-content-optimized"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <motion.h1
            className="featured-title-optimized"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            FEATURED<br />PRODUCT
          </motion.h1>

          <motion.p
            className="featured-description-optimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </motion.p>

          <motion.div
            className="cta-wrapper-optimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <button
              className="cta-button-optimized"
              onClick={() => navigate("/products")} 
            >
              EXPLORE
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>

          {/* Tech Stats */}
          <motion.div
            className="tech-stats-optimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <div className="stat-item-optimized">
              <span className="stat-value-optimized">98%</span>
              <span className="stat-label-optimized">ACCURACY</span>
            </div>
            <div className="stat-item-optimized">
              <span className="stat-value-optimized">24/7</span>
              <span className="stat-label-optimized">TRACKING</span>
            </div>
            <div className="stat-item-optimized">
              <span className="stat-value-optimized">5ATM</span>
              <span className="stat-label-optimized">WATERPROOF</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}