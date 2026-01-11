"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import CategoryFilter, { Category } from "./components/CategoryFilter";
import SearchAndFilters from "./components/SearchAndFilters";
import ProductGrid, { Product } from "./components/ProductGrid";
import HeroProducts from "../../HomePagesPage/Products-hub/components/HeroProduct";

import "../../../assets/css/Product.css";


// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// FadeReveal component - returns plain div on mobile
const FadeReveal: React.FC<{ children: React.ReactNode; isMobile: boolean }> = ({ children, isMobile }) => {
  if (isMobile) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      viewport={{ amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  /* ===========================
      DEMO PRODUCTS
  ============================ */
  const demoProducts: Product[] = [
    {
      id: 1,
      pid: "P1001",
      name: "BEESEE LAPTOP X1",
      tagline: "Powerful performance, elegant design for professionals",
      category_id: "laptops",
      category: "Laptops",
      price: 49999,
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Intel Core i7-12700H",
        ram: "32GB DDR5",
        ssd: "1TB NVMe SSD",
        display: '16" 4K OLED',
        battery: "12 hours",
        gpu: "NVIDIA RTX 4070",
      },
    },
    {
      id: 2,
      pid: "P1002",
      name: "BEESEE ULTRA DISPLAY",
      tagline: "Crystal clear visuals with immersive experience",
      category_id: "displays",
      category: "Displays",
      price: 14999,
      image: "/assets/images/productHub/p3.png",
      specs: {
        display: '32" 4K HDR',
        ram: "Built-in 8GB",
        storage: "Smart OS 64GB",
      },
    },
    {
      id: 3,
      pid: "P1003",
      name: "BEESEE SMART WATCH",
      tagline: "Your health and fitness companion",
      category_id: "wearables",
      category: "Wearables",
      price: 5999,
      image: "/assets/images/productHub/p4.png",
      specs: {
        display: '1.8" AMOLED',
        battery: "7 days",
        storage: "32GB",
        ram: "2GB LPDDR4",
      },
    },
    {
      id: 4,
      pid: "P1005",
      name: "BEESEE GAMING LAPTOP",
      tagline: "Extreme performance for gamers and creators",
      category_id: "laptops",
      category: "Laptops",
      price: 89999,
      image: "/assets/images/productHub/p2.png",
      specs: {
        cpu: "Intel Core i9-13900HX",
        ram: "64GB DDR5",
        ssd: "2TB NVMe SSD",
        display: '17.3" QHD 240Hz',
        gpu: "NVIDIA RTX 4090",
        battery: "6 hours",
      },
    },
    {
      id: 5,
      pid: "P1007",
      name: "BEESEE FOLDABLE TABLET",
      tagline: "Innovation that fits in your pocket",
      category_id: "tablets",
      category: "Tablets",
      price: 39999,
      image: "/assets/images/productHub/p6.png",
      specs: {
        display: '8.3" Foldable OLED',
        cpu: "Snapdragon 8 Gen 3",
        ram: "12GB LPDDR5X",
        storage: "1TB UFS 4.0",
        battery: "18 hours",
      },
    },
    {
      id: 6,
      pid: "P1009",
      name: "BEESEE FITNESS BAND",
      tagline: "Track every step of your fitness journey",
      category_id: "wearables",
      category: "Wearables",
      price: 1999,
      image: "/assets/images/productHub/p5.png",
      specs: {
        battery: "14 days",
        display: '1.4" Always-on',
        storage: "16GB",
        ram: "1GB",
      },
    },
    {
      id: 7,
      pid: "P1010",
      name: "BEESEE PRO DISPLAY",
      tagline: "Professional-grade monitor for creative work",
      category_id: "displays",
      category: "Displays",
      price: 29999,
      image: "/assets/images/productHub/p1.png",
      specs: {
        display: '27" 5K Retina',
        refreshRate: "120Hz",
        colorGamut: "P3 99%",
      },
    },
    {
      id: 8,
      pid: "P1011",
      name: "BEESEE BUSINESS LAPTOP",
      tagline: "Secure and reliable for enterprise use",
      category_id: "laptops",
      category: "Laptops",
      price: 69999,
      image: "/assets/images/productHub/p2.png",
      specs: {
        cpu: "Intel Core i7-1360P",
        ram: "16GB DDR5",
        ssd: "512GB NVMe SSD",
        display: '14" FHD',
        security: "TPM 2.0, Fingerprint",
      },
    },
    {
      id: 9,
      pid: "P1012",
      name: "BEESEE SMART TABLET",
      tagline: "Perfect blend of productivity and entertainment",
      category_id: "tablets",
      category: "Tablets",
      price: 24999,
      image: "/assets/images/productHub/p6.png",
      specs: {
        display: '11" 2.5K',
        cpu: "Snapdragon 7 Gen 2",
        ram: "8GB LPDDR5",
        storage: "256GB",
        battery: "15 hours",
      },
    },
  ];

  const categories: Category[] = [
    { id: "all", name: "All Products", count: demoProducts.length },
    { id: "laptops", name: "Laptops", count: demoProducts.filter((p) => p.category_id === "laptops").length },
    { id: "displays", name: "Displays", count: demoProducts.filter((p) => p.category_id === "displays").length },
    { id: "wearables", name: "Wearables", count: demoProducts.filter((p) => p.category_id === "wearables").length },
    { id: "tablets", name: "Tablets", count: demoProducts.filter((p) => p.category_id === "tablets").length },
  ];

  /* ===========================
     FILTERS / SORT / PAGINATION
  ============================ */
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Products - Beesee Global Technology Inc.";
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let min = 0;
    let max = Infinity;

    if (priceRange.includes("-")) {
      const [low, high] = priceRange.split("-");
      min = parseInt(low);
      max = parseInt(high);
    } else if (priceRange.endsWith("+")) {
      min = parseInt(priceRange.replace("+", ""));
    }

    return demoProducts.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.category_id === selectedCategory;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        Object.values(p.specs).some((spec) => spec?.toLowerCase().includes(q));

      const matchPrice = p.price >= min && p.price <= max;

      return matchCategory && matchSearch && matchPrice;
    });
  }, [selectedCategory, searchQuery, priceRange]);

  const sortedProducts = useMemo(() => {
    let arr = [...filteredProducts];
    if (sortBy === "name-asc") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name-desc") arr.sort((a, b) => b.name.localeCompare(a.name));
    if (sortBy === "price-asc") arr.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [sortBy, filteredProducts]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange("");
    setSortBy("name-asc");
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to products grid
    const productsGrid = document.querySelector('.products-grid-container');
    if (productsGrid) {
      productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => goToPage(Math.min(totalPages, currentPage + 1));

  /* ======================================================
       UI / PAGE RENDER
  ====================================================== */
  return (
    <div className="products-hub min-h-screen bg-[#000000]">

      {/* 🔥 HERO SECTION */}
      <HeroProducts />

      {/* MAIN SECTION */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          {isMobile ? (
            // MOBILE VERSION - No animations
            <div>
              <div>
                <SearchAndFilters
                  searchQuery={searchQuery}
                  onSearchChange={(v) => {
                    setSearchQuery(v);
                    setCurrentPage(1);
                  }}
                  sortBy={sortBy}
                  onSortChange={(v) => {
                    setSortBy(v);
                    setCurrentPage(1);
                  }}
                  showFilters={showFilters}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  onClearFilters={handleClearFilters}
                  priceRange={priceRange}
                  onPriceRangeChange={(v) => {
                    setPriceRange(v);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="mb-8">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(c) => {
                    setSelectedCategory(c);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="bee-body-sm text-[#C7B897] mt-6 mb-4">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" &&
                  ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
              </div>

              <div className="products-grid-container">
                <ProductGrid
                  products={paginatedProducts}
                  onProductClick={(p) => navigate(`/product/${p.pid}`)}
                />
              </div>

              {/* PAGINATION - Using FAQs design */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col gap-4">
                  <div className="bee-body-sm text-[#C7B897] text-center pagination-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  
                  <div className="pagination-wrapper w-full overflow-x-auto">
                    <div className="pagination-controls flex items-center justify-center gap-1">
                      {/* First Page */}
                      <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        aria-label="First page"
                      >
                        <ChevronsLeft size={16} />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Page Numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;
                        
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        // First page with ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => goToPage(1)}
                              className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
                            >
                              1
                            </button>
                          );
                          
                          if (startPage > 2) {
                            pages.push(
                              <div key="ellipsis-start" className="pagination-ellipsis">
                                ...
                              </div>
                            );
                          }
                        }

                        // Page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => goToPage(i)}
                              className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Last page with ellipsis if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <div key="ellipsis-end" className="pagination-ellipsis">
                                ...
                              </div>
                            );
                          }
                          
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => goToPage(totalPages)}
                              className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      {/* Next Page */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        aria-label="Next page"
                      >
                        <ChevronRight size={16} />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={goToLastPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        aria-label="Last page"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // DESKTOP VERSION - With animations
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <FadeReveal isMobile={isMobile}>
                <SearchAndFilters
                  searchQuery={searchQuery}
                  onSearchChange={(v) => {
                    setSearchQuery(v);
                    setCurrentPage(1);
                  }}
                  sortBy={sortBy}
                  onSortChange={(v) => {
                    setSortBy(v);
                    setCurrentPage(1);
                  }}
                  showFilters={showFilters}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  onClearFilters={handleClearFilters}
                  priceRange={priceRange}
                  onPriceRangeChange={(v) => {
                    setPriceRange(v);
                    setCurrentPage(1);
                  }}
                />
              </FadeReveal>

              <FadeReveal isMobile={isMobile}>
                <div className="mb-8">
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(c) => {
                      setSelectedCategory(c);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </FadeReveal>

              <div className="bee-body-sm text-[#C7B897] mt-6 mb-4 pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" &&
                  ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
              </div>

              <FadeReveal isMobile={isMobile}>
                <div className="products-grid-container">
                  <ProductGrid
                    products={paginatedProducts}
                    onProductClick={(p) => navigate(`/product/${p.pid}`)}
                  />
                </div>
              </FadeReveal>

              {/* PAGINATION - Using FAQs design */}
              {totalPages > 1 && (
                <FadeReveal isMobile={isMobile}>
                  <div className="mt-8 flex flex-col gap-4">
                    <div className="bee-body-sm text-[#C7B897] text-center pagination-info">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                    
                    <div className="pagination-wrapper w-full overflow-x-auto">
                      <div className="pagination-controls flex items-center justify-center gap-1">
                        {/* First Page */}
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                          aria-label="First page"
                        >
                          <ChevronsLeft size={16} />
                        </button>

                        {/* Previous Page */}
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="pagination-btn"
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }

                          // First page with ellipsis if needed
                          if (startPage > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => goToPage(1)}
                                className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
                              >
                                1
                              </button>
                            );
                            
                            if (startPage > 2) {
                              pages.push(
                                <div key="ellipsis-start" className="pagination-ellipsis">
                                  ...
                                </div>
                              );
                            }
                          }

                          // Page numbers
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => goToPage(i)}
                                className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                              >
                                {i}
                              </button>
                            );
                          }

                          // Last page with ellipsis if needed
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <div key="ellipsis-end" className="pagination-ellipsis">
                                  ...
                                </div>
                              );
                            }
                            
                            pages.push(
                              <button
                                key={totalPages}
                                onClick={() => goToPage(totalPages)}
                                className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
                              >
                                {totalPages}
                              </button>
                            );
                          }

                          return pages;
                        })()}

                        {/* Next Page */}
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                          aria-label="Next page"
                        >
                          <ChevronRight size={16} />
                        </button>

                        {/* Last Page */}
                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="pagination-btn"
                          aria-label="Last page"
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeReveal>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsHub;