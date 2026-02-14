"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import CategoryFilter, { Category } from "./components/CategoryFilter";
import SearchAndFilters from "./components/SearchAndFilters";
import ProductGrid, { Product } from "./components/ProductGrid";
import HeroProducts from "../../HomePagesPage/Products-hub/components/HeroProduct";
import { fetchAllProductPublic } from '../../../services/Ecommerce/productServices'
import { fetchAllCategoryPublic } from '../../../services/Ecommerce/categoryServices'
import { useQuery } from "@tanstack/react-query";

import "../../../assets/css/Product.css";

// Import mock data
import mockProducts from "../../../data/mockProductData.json";

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

// Format price for display
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Process mock products to match our structure
const processMockProducts = (mockData: any): Product[] => {
  return mockData.products.map((product: any, index: number) => {
    // Get category-specific hover specs
    const category = mockData.categories.find((c: any) => c.id === product.category);
    const hoverSpecs = category?.hoverSpecs || [];
    
    // Extract the 4 main specs for hover effect from detailedSpecs
    const hoverSpecsData: Record<string, string> = {};

    // If the product already provides a flat `specs` object, prefer those values first
    if (product.specs && typeof product.specs === 'object') {
      Object.entries(product.specs).forEach(([k, v]) => {
        if (v) hoverSpecsData[k] = String(v);
      });
    }
    
    // Map hover spec keys to detailedSpecs
    hoverSpecs.forEach((specKey: string) => {
      // Search through detailedSpecs to find matching values
      if (product.detailedSpecs) {
        for (const [category, specs] of Object.entries(product.detailedSpecs)) {
          const specsObj = specs as Record<string, string>;
          
          // Match common spec keys
          switch(specKey) {
            case 'cpu':
              if (specsObj['Processor']) hoverSpecsData['cpu'] = specsObj['Processor'];
              break;
            case 'ram':
              if (specsObj['RAM']) hoverSpecsData['ram'] = specsObj['RAM'];
              break;
            case 'storage':
              if (specsObj['Storage']) hoverSpecsData['storage'] = specsObj['Storage'];
              break;
            case 'display':
              if (specsObj['Size']) hoverSpecsData['display'] = specsObj['Size'];
              else if (specsObj['Resolution']) hoverSpecsData['display'] = specsObj['Resolution'];
              break;
            case 'battery':
              if (specsObj['Battery Life']) hoverSpecsData['battery'] = specsObj['Battery Life'];
              else if (specsObj['Typical Use']) hoverSpecsData['battery'] = specsObj['Typical Use'];
              else if (specsObj['Capacity']) hoverSpecsData['battery'] = specsObj['Capacity'];
              break;
            case 'sensors':
              if (specsObj['Heart Rate']) hoverSpecsData['sensors'] = specsObj['Heart Rate'];
              else if (specsObj['ECG']) hoverSpecsData['sensors'] = specsObj['ECG'];
              else if (specsObj['Blood Oxygen']) hoverSpecsData['sensors'] = specsObj['Blood Oxygen'];
              else if (specsObj['SpO2']) hoverSpecsData['sensors'] = specsObj['SpO2'];
              else if (specsObj['Sensors']) hoverSpecsData['sensors'] = specsObj['Sensors'];
              break;
            case 'connectivity':
              if (specsObj['Bluetooth']) hoverSpecsData['connectivity'] = specsObj['Bluetooth'];
              else if (specsObj['WiFi']) hoverSpecsData['connectivity'] = specsObj['WiFi'];
              break;
            case 'resolution':
              if (specsObj['Resolution']) hoverSpecsData['resolution'] = specsObj['Resolution'];
              break;
            case 'refresh_rate':
              if (specsObj['Refresh Rate']) hoverSpecsData['refresh_rate'] = specsObj['Refresh Rate'];
              break;
            case 'panel_type':
              if (specsObj['Panel Type']) hoverSpecsData['panel_type'] = specsObj['Panel Type'];
              break;
            case 'smart_features':
              if (specsObj['OS']) hoverSpecsData['smart_features'] = specsObj['OS'];
              break;
            case 'touchscreen':
              if (specsObj['Touch Points']) hoverSpecsData['touchscreen'] = specsObj['Touch Points'];
              else if (specsObj['Type']) hoverSpecsData['touchscreen'] = specsObj['Type'];
              break;
          }
        }
      }
    });

    return {
      id: index + 1,
      pid: product.pid,
      name: product.name,
      tagline: product.tagline,
      category_id: product.category,
      category: mockData.categories.find((c: any) => c.id === product.category)?.name || product.category,
      price: product.price,
      formattedPrice: formatPrice(product.price),
      image: product.image,
      gallery: product.gallery,
      description: product.description,
      keyFeatures: product.keyFeatures,
      specs: hoverSpecsData, // Only include hover specs for the card
      detailedSpecs: product.detailedSpecs, // Full specs for detail page
      hoverSpecs: hoverSpecs,
      inStock: true,
      rating: 4.5,
      reviews: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
};

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

   const categoriesDumpData: Category[] = [
    { 
      id: "all", 
      name: "All Products",  
      hoverSpecs: []
    },
    { 
      id: "laptop", 
      name: "Laptops",  
      icon: "💻",
      hoverSpecs: ["cpu", "ram", "storage", "display"]
    },
    { 
      id: "smartwatch", 
      name: "Wearables",  
      icon: "⌚",
      hoverSpecs: ["display", "battery", "sensors", "connectivity"]
    },
    { 
      id: "smarttv", 
      name: "Interactive Smart TVs",  
      icon: "📺",
      hoverSpecs: ["display", "resolution", "refresh_rate", "panel_type"]
    },
    { 
      id: "tablet", 
      name: "Tablets",  
      icon: "📱",
      hoverSpecs: ["cpu", "ram", "storage", "display"]
    },
/*     { 
      id: "kiosk", 
      name: "Kiosk Machines", 
      count: demoProducts.filter((p) => p.category_id === "kiosk").length,
      icon: "🏧",
      hoverSpecs: ["display", "cpu", "storage", "touchscreen"]
    } */
  ];

  const { data: categories } = useQuery({
    queryKey: ["category"],
    // queryFn: async () => {
    //   const categories = await fetchAllCategoryPublic();
    //   // Normalize categories: ensure each item has `id`, `name`, `icon`.
    //   const mapped = (categories || []).map((c: any, idx: number) => ({
    //     id: c.id ?? String(c.name || `cat-${idx}`),
    //     name: c.name,
    //     icon: c.icon,
    //   }));
    //   // Add "All Products" at the beginning with id 'all'
    //   return [{ id: 'all', name: "All Products", icon: "Server" }, ...mapped];
    // },
  });

  const effectiveCategories = useMemo(
    () => (categories && categories.length > 0 ? categories : categoriesDumpData),
    [categories, categoriesDumpData]
  );

  const {
    data: products
  } = useQuery({
    queryKey: ["products"],
    // queryFn: () => fetchAllProductPublic()
  })

  console.log("product", products)
 
  // Build demo products either from API `products` or fallback to mock data
  const demoProducts = useMemo(() => {
    const normalizeKey = (raw: string) => {
      if (!raw) return raw;
      const k = raw.toLowerCase().trim();
      if (k.includes('processor') || k.includes('cpu')) return 'cpu';
      if (k === 'ram' || k.includes('ram')) return 'ram';
      if (k.includes('storage')) return 'storage';
      if (k.includes('display') || k.includes('size')) return 'display';
      if (k.includes('battery')) return 'battery';
      if (k.includes('resolution')) return 'resolution';
      if (k.includes('refresh')) return 'refresh_rate';
      if (k.includes('panel')) return 'panel_type';
      if (k.includes('sensor') || k.includes('ecg') || k.includes('spo2') || k.includes('blood')) return 'sensors';
      if (k.includes('wifi') || k.includes('bluetooth')) return 'connectivity';
      return k.replace(/[^a-z0-9_]/g, '_');
    };

    if (products && Array.isArray(products)) {
      return products.map((product: any, index: number) => {
        const hover = product.hover_specs || [];
        const hoverSpecsData: Record<string, string> = {};
        const hoverSpecIcons: Record<string, string> = {};

        hover.forEach((h: any) => {
          const key = normalizeKey(h.key || h.key_name || '');
          if (!key) return;
          hoverSpecsData[key] = String(h.value ?? '');
          if (h.icon) hoverSpecIcons[key] = h.icon;
        });

        // attempt to find category id from fetched categories
        const matchedCat = effectiveCategories.find(
          (c: any) => c.name === product.category_name || c.name === product.category
        );

        return {
          id: index + 1,
          pid: product.pid,
          name: product.name,
          tagline: product.tagline || '',
          category_id: matchedCat?.id ?? String(product.category_name || product.category || '').toLowerCase(),
          category: product.category_name || product.category || 'Unknown',
          price: product.price ?? 0,
          formattedPrice: formatPrice(product.price ?? 0),
          image: product.image_url || product.image || '',
          gallery: product.gallery || [],
          description: product.description || '',
          keyFeatures: product.keyFeatures || [],
          specs: hoverSpecsData,
          specIcons: hoverSpecIcons,
          detailedSpecs: product.detailedSpecs || {},
          hoverSpecs: hover.map((h: any) => h.key),
          inStock: product.inStock ?? true,
          rating: product.rating ?? 4.5,
          reviews: product.reviews ?? 0,
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.updatedAt || new Date().toISOString()
        } as Product;
      });
    }

    return processMockProducts(mockProducts);
  }, [products, effectiveCategories]);
 

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
  }, [selectedCategory, searchQuery, priceRange, demoProducts]);

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
                  categories={effectiveCategories}
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
                  ` in ${effectiveCategories.find((c) => c.id === selectedCategory)?.name}`}
              </div>

              <div className="products-grid-container">
                <ProductGrid
                  products={paginatedProducts}
                  onProductClick={(p) => navigate(`/product/${p.pid}`)}
                />
              </div>

              {/* PAGINATION */}
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
                    categories={effectiveCategories}
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
                  ` in ${effectiveCategories.find((c) => c.id === selectedCategory)?.name}`}
              </div>

              <FadeReveal isMobile={isMobile}>
                <div className="products-grid-container">
                  <ProductGrid
                    products={paginatedProducts}
                    onProductClick={(p) => navigate(`/product/${p.pid}`)}
                  />
                </div>
              </FadeReveal>

              {/* PAGINATION */}
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
