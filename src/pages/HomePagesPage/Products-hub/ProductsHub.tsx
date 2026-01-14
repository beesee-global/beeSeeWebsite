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

// UPDATED PRODUCTS BASED ON YOUR IMAGES
const demoProducts: Product[] = [
  {
    id: 1,
    pid: "P1001",
    name: "EDUCATIONAL SMART TV - 86 INCH",
    tagline: "Immersive display for collaborative learning",
    category_id: "tvs",
    category: "Interactive TVs",
    price: 149999,
    image: "/assets/images/productHub/InteractiveTV86.png",
    specs: {
      display: '86" 4K UHD',
      resolution: "3840 x 2160",
      connectivity: "Wi-Fi 6, Bluetooth 5.2",
      ports: "HDMI, USB-C, Ethernet",
      touch_points: "20-point multi-touch",
    },
    description: "EDUCATIONAL SMART TV - 86 INCH",
  },
  {
    id: 2,
    pid: "P1002",
    name: "INTERACTIVE SMART TV - 75 INCH",
    tagline: "Immersive display for collaborative learning",
    category_id: "tvs",
    category: "Interactive TVs",
    price: 129999,
    image: "/assets/images/productHub/InteractiveTV75.png",
    specs: {
      display: '75" 4K UHD',
      resolution: "3840 x 2160",
      connectivity: "Wi-Fi 6, Bluetooth 5.2",
      ports: "HDMI, USB-C, Ethernet",
      touch_points: "20-point multi-touch",
    },
    description: "INTERACTIVE SMART TV - 75 INCH",
  },
  {
    id: 3,
    pid: "P1003",
    name: "DUOS",
    tagline: "Double the productivity, double the innovation",
    category_id: "laptops",
    category: "Laptops",
    price: 89999,
    image: "/assets/images/productHub/LaptopDuos.png",
    specs: {
      display: '14" FHD Dual Screens',
      cpu: "Intel Core i7-1360P",
      ram: "16GB DDR5",
      storage: "1TB NVMe SSD",
      os: "Windows 11 Pro",
    },
    description: " DUOS",
  },
  {
    id: 4,
    pid: "P1004",
    name: "ELITE",
    tagline: "Premium performance for education leaders",
    category_id: "laptops",
    category: "Laptops",
    price: 74999,
    image: "/assets/images/productHub/LaptopElite.png",
    specs: {
      display: '15.6" QHD IPS',
      cpu: "AMD Ryzen 7 7840U",
      ram: "32GB LPDDR5",
      storage: "2TB PCIe 4.0 SSD",
      battery: "20 hours",
    },
    description: "ELITE",
  },
  {
    id: 5,
    pid: "P1005",
    name: "FUSION",
    tagline: "Where versatility meets performance",
    category_id: "laptops",
    category: "Laptops",
    price: 64999,
    image: "/assets/images/productHub/LaptopFusion.png",
    specs: {
      display: '13.3" 2-in-1 Touch',
      cpu: "Intel Core i5-1345U",
      ram: "16GB LPDDR4X",
      storage: "512GB SSD",
      os: "Windows 11 Education",
    },
    description: "FUSION",
  },
  {
    id: 6,
    pid: "P1006",
    name: "PRO",
    tagline: "Professional-grade computing for educators",
    category_id: "laptops",
    category: "Laptops",
    price: 84999,
    image: "/assets/images/productHub/LaptopPro.png",
    specs: {
      display: '16" QHD+ IPS',
      cpu: "Intel Core i9-13900H",
      ram: "64GB DDR5",
      storage: "4TB NVMe SSD",
      gpu: "NVIDIA RTX 4060",
    },
    description: "PRO",
  },
  {
    id: 7,
    pid: "P1007",
    name: "BEEPAD",
    tagline: "Innovation that fits in your pocket",
    category_id: "tablets",
    category: "Tablets",
    price: 39999,
    image: "/assets/images/productHub/TabletBeepad.png",
    specs: {
      display: '8.3" Foldable OLED',
      cpu: "Snapdragon 8 Gen 3",
      ram: "12GB LPDDR5X",
      storage: "1TB UFS 4.0",
      battery: "18 hours",
    },
    description: "BEEPAD",
  },
];

const categories: Category[] = [
  { id: "all", name: "All Products", count: demoProducts.length },
  { id: "tvs", name: "Interactive TVs", count: demoProducts.filter((p) => p.category_id === "tvs").length },
  { id: "laptops", name: "Laptops", count: demoProducts.filter((p) => p.category_id === "laptops").length },
  { id: "tablets", name: "Tablets", count: demoProducts.filter((p) => p.category_id === "tablets").length },
];

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const itemsPerPage = 9;
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