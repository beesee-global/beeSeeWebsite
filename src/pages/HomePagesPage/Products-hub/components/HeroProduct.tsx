"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "../../../../assets/css/featuredProduct.css";
import "../../../../assets/css/global.css";
import { useNavigate } from "react-router-dom";
import { fetchSpecificDisplayPublic } from '../../../../services/Ecommerce/featureProduct'
import { useQuery } from "@tanstack/react-query";

// TypeScript interfaces
interface ProductBadge {
  id: string;
  text: string;
  position: number; 
}

interface FeaturedProduct {
  id: string;
  name: string;
  imageUrl: string;
  badges: ProductBadge[];
  position: number; 
}

interface TechStat {
  id: string;
  value: string;
  label: string;
  order: number;
}

interface FeaturedProductData {
  title: string;
  description: string;
  products: FeaturedProduct[];
  techStats: TechStat[];
}

export default function ProductShowcase() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [featuredData, setFeaturedData] = useState<FeaturedProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { data: featuresProduct } = useQuery({
    queryKey: ["features"],
    // queryFn: () => fetchSpecificDisplayPublic(),
    refetchInterval: 10000,
  });

  // Default/fallback data
  const getDefaultData = (): FeaturedProductData => ({
    title: "FEATURED PRODUCTS",
    description: "The ultra-slim chassis houses a long-life battery system calibrated for extended uptime without performance throttling. With optimized hardware acceleration and modern connectivity support, the device is built to meet the requirements of power users, professionals, and performance-driven environments.",
    products: [
      {
        id: "product-1",
        name: "Product Model X",
        imageUrl: "/featuredProduct/LaptopPro.png",
        position: 1,
        badges: [
          { id: "badge-1", text: "144Hz", position: 1 },
          { id: "badge-2", text: "Premium", position: 2 },
          { id: "badge-3", text: "4.9★", position: 3 }
        ]
      },
      {
        id: "product-2",
        name: "Product Model Pro",
        imageUrl: "/featuredProduct/LaptopDuos.png",
        position: 2,
        badges: [
          { id: "badge-4", text: "Advanced", position: 4 },
          { id: "badge-5", text: "Turbo Mode", position: 5 },
          { id: "badge-6", text: "99% EF", position: 6 }
        ]
      }
    ],
    techStats: [
      { id: "stat-1", value: "HIGH-PERFORMANCE", label: "PROCESSING", order: 1 },
      { id: "stat-2", value: "LONG-LASTING", label: "BATTERY LIFE", order: 2 },
      { id: "stat-3", value: "LUXURIOUS", label: "DESIGN", order: 3 }
    ]
  });

  // Fetch featured data
  useEffect(() => {
    setFeaturedData(featuresProduct || getDefaultData());
    setLoading(false);
  }, [featuresProduct]);

  // Mounted + mobile detection
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse tracking for desktop
  useEffect(() => {
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

  if (!mounted || loading || !featuredData) return null;

  const data = featuredData;
  const sortedProducts = [...data.products].sort((a, b) => a.position - b.position);
  const sortedStats = [...data.techStats].sort((a, b) => a.order - b.order);
  const product1 = sortedProducts[0];
  const product2 = sortedProducts[1];

  // Mobile view
  if (isMobile) {
    return (
      <div className="featured-showcase-optimized hero-wrapper-no-clip">
        <div className="featured-content-optimized safe-container">
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

            {product1 && (
              <div className="watch-item-optimized watch-red-optimized bg-transparent">
                <img 
                  src={product1.imageUrl}
                  alt={product1.name}
                  className="watch-img-optimized bg-transparent block w-full h-auto"
                />
                {product1.badges.map((badge) => (
                  <div key={badge.id} className={`data-badge badge-${badge.position}`}>
                    {badge.text}
                  </div>
                ))}
              </div>
            )}

            {product2 && (
              <div className="watch-item-optimized watch-green-optimized bg-transparent">
                <img 
                  src={product2.imageUrl}
                  alt={product2.name}
                  className="watch-img-optimized bg-transparent block w-full h-auto"
                />
                {product2.badges.map((badge) => (
                  <div key={badge.id} className={`data-badge badge-${badge.position}`}>
                    {badge.text}
                  </div>
                ))}
              </div>
            )}

            <div className="orbital-ring ring-1" />
            <div className="orbital-ring ring-2" />
          </div>

          <div className="text-content-optimized">
            <h1 className="bee-title-lg text-[#FDCC00] mb-4 sm:mb-5">{data.title}</h1>
            <p className="featured-description-optimized bee-body-lg">{data.description}</p>
            <div className="cta-wrapper-optimized" />
            <div className="tech-stats-optimized">
              {sortedStats.map((stat) => (
                <div key={stat.id} className="stat-item-optimized">
                  <span className={`stat-value-optimized bee-title-sm ${!isMobile ? "whitespace-nowrap" : ""}`}>{stat.value}</span>
                  <span className={`stat-label-optimized bee-body-sm ${!isMobile ? "whitespace-nowrap" : ""}`}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="featured-showcase-optimized hero-wrapper-no-clip">
      <div className="featured-content-optimized safe-container">
        <motion.div
          className="watches-stage-optimized"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          style={{
            transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3}px)`
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

          {product1 && (
            <motion.div
              className="watch-item-optimized watch-red-optimized bg-transparent"
              initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              transition={{ duration: 1.2 }}
              whileHover={{ scale: 1.05, rotate: -5 }}
            >
              <img 
                src={product1.imageUrl}
                alt={product1.name}
                className="watch-img-optimized bg-transparent block w-full h-auto"
              />
              {product1.badges.map((badge) => (
                <div key={badge.id} className={`data-badge badge-${badge.position}`}>
                  {badge.text}
                </div>
              ))}
            </motion.div>
          )}

          {product2 && (
            <motion.div
              className="watch-item-optimized watch-green-optimized bg-transparent"
              initial={{ opacity: 0, scale: 0.8, rotate: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 12 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotate: 15 }}
            >
              <img 
                src={product2.imageUrl}
                alt={product2.name}
                className="watch-img-optimized bg-transparent block w-full h-auto"
              />
              {product2.badges.map((badge) => (
                <div key={badge.id} className={`data-badge badge-${badge.position}`}>
                  {badge.text}
                </div>
              ))}
            </motion.div>
          )}

          <div className="orbital-ring ring-1" />
          <div className="orbital-ring ring-2" />
        </motion.div>

        <motion.div
          className="text-content-optimized"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="featured-title-optimized single-line-title bee-title-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {data.title}
          </motion.h1>

          <motion.p
            className="featured-description-optimized bee-body-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {data.description}
          </motion.p>

          <motion.div className="cta-wrapper-optimized" />

          <motion.div
            className="tech-stats-optimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {sortedStats.map((stat) => (
              <div key={stat.id} className="stat-item-optimized">
                <span className={`stat-value-optimized bee-title-sm ${!isMobile ? "whitespace-nowrap" : ""}`}>{stat.value}</span>
                <span className={`stat-label-optimized bee-body-sm ${!isMobile ? "whitespace-nowrap" : ""}`}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
