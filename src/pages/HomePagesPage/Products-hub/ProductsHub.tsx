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
import { getIconNameForSpec } from '../../../config/specIconMap';
import { getProductCutout } from '../../../config/productDisplayAssets';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    const checkMobile = (event: MediaQueryListEvent | MediaQueryList) => setIsMobile(event.matches);

    checkMobile(mobileViewport);
    mobileViewport.addEventListener("change", checkMobile);
    return () => mobileViewport.removeEventListener("change", checkMobile);
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
    // use central getIconNameForSpec from config/specIconMap
    
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
            case 'gpu':
              if (specsObj['Graphics']) hoverSpecsData['gpu'] = specsObj['Graphics'];
              else if (specsObj['GPU']) hoverSpecsData['gpu'] = specsObj['GPU'];
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
              else if (specsObj['Operating System']) hoverSpecsData['smart_features'] = specsObj['Operating System'];
              else if (specsObj['Operating system']) hoverSpecsData['smart_features'] = specsObj['Operating system'];
              break;
            case 'touchscreen':
              if (specsObj['Touch Points']) hoverSpecsData['touchscreen'] = specsObj['Touch Points'];
              else if (specsObj['Type']) hoverSpecsData['touchscreen'] = specsObj['Type'];
              break;
          }
        }
      }
    });

    // Build spec icon mapping for mock products (string names for lucide loader)
    const hoverSpecIcons: Record<string, string> = {};
    Object.keys(hoverSpecsData).forEach((sk) => {
      hoverSpecIcons[sk] = getIconNameForSpec(sk);
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
      specIcons: hoverSpecIcons,
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

const setProductsPageMeta = () => {
  document.title = "Products - Beesee Global Technology Inc.";
  createOrUpdateMeta("description", "Browse Beesee Global Technology's smart TVs, laptops, tablets, and wearables. Discover advanced business and education hardware solutions.");
  createOrUpdateMeta("robots", "index, follow");
  createOrUpdateLink("canonical", "https://www.beesee.ph/products");
  createOrUpdateProperty("og:title", "Products | Beesee Global Technology Inc.");
  createOrUpdateProperty("og:description", "Browse Beesee Global Technology's smart TVs, laptops, tablets, and wearables. Discover advanced business and education hardware solutions.");
  createOrUpdateProperty("og:url", "https://www.beesee.ph/products");
  createOrUpdateProperty("og:type", "website");
  createOrUpdateMeta("twitter:card", "summary_large_image");
  createOrUpdateMeta("twitter:title", "Products | Beesee Global Technology Inc.");
  createOrUpdateMeta("twitter:description", "Browse Beesee Global Technology's smart TVs, laptops, tablets, and wearables. Discover advanced business and education hardware solutions.");
};

const getCategoryFilterId = (value?: string) => {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (normalized.includes("smarttv") || normalized.includes("television") || normalized === "tv") return "smarttv";
  if (normalized.includes("laptop") || normalized.includes("notebook")) return "laptop";
  if (normalized.includes("tablet") || normalized.includes("beepad")) return "tablet";
  if (normalized.includes("watch") || normalized.includes("wearable")) return "smartwatch";
  return normalized;
};

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    setProductsPageMeta();
  }, []);

  const { data: categoriesFromDb } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchAllCategoryPublic,
    staleTime: 60_000,
  });

  const effectiveCategories = useMemo<Category[]>(() => {
    const source = Array.isArray(categoriesFromDb)
      ? categoriesFromDb
      : Array.isArray(categoriesFromDb?.data)
        ? categoriesFromDb.data
        : [];

    return [
      { id: "all", name: "All Products", icon: "Boxes", hoverSpecs: [] },
      ...source
        .filter((category: any) => category?.name)
        .map((category: any) => ({
          id: category.id ?? getCategoryFilterId(category.name),
          name: String(category.name),
          icon: category.icon || "Tag",
          hoverSpecs: [],
        })),
    ];
  }, [categoriesFromDb]);

  const {
    data: products
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetchAllProductPublic();
      // Public APIs may return a raw list or wrap it in `products`/`data`.
      // Accept both so products created through the admin panel are not
      // discarded in favour of the bundled mock catalogue.
      const candidates = [
        res,
        res?.products,
        res?.data,
        res?.data?.products,
        res?.data?.data,
        res?.result,
        res?.result?.products,
        res?.payload?.products,
      ];
      return (candidates.find(Array.isArray) || []) as Product[];
    },
    // Enable fetching from API to show newly created products
    enabled: true,
  })

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
        const productImages = Array.isArray(product.images) ? product.images : [];
        const gallery = Array.isArray(product.gallery) && product.gallery.length
          ? product.gallery
          : productImages.map((image: any) => image.image_url || image.url).filter(Boolean);
        const configuredImage = product.image_url || product.image || gallery[0] || '';
        let hover = product.hover_specs || [];
        if (typeof hover === 'string') {
          try {
            hover = JSON.parse(hover);
          } catch {
            hover = [];
          }
        }
        if (!Array.isArray(hover)) hover = [];
        const hoverSpecsData: Record<string, string> = {};
        const hoverSpecIcons: Record<string, string> = {};

        hover.forEach((h: any) => {
          const key = normalizeKey(h.key || h.key_name || '');
          if (!key) return;
          hoverSpecsData[key] = String(h.value ?? '');
          if (h.icon) hoverSpecIcons[key] = h.icon;
          if (!hoverSpecIcons[key]) hoverSpecIcons[key] = getIconNameForSpec(key);
        });

        // attempt to find category id from fetched categories
        const sourceCategory = product.category_name || product.category || "";
        const resolvedCategoryId = getCategoryFilterId(sourceCategory);
        const matchedCat = effectiveCategories.find(
          (c: any) => getCategoryFilterId(String(c.id)) === resolvedCategoryId
            || getCategoryFilterId(c.name) === resolvedCategoryId
        );

        return {
          id: index + 1,
          pid: product.pid,
          name: product.name,
          tagline: product.tagline || '',
          category_id: String(matchedCat?.id ?? resolvedCategoryId),
          category: sourceCategory || 'Unknown',
          price: product.price ?? 0,
          formattedPrice: formatPrice(product.price ?? 0),
          image: getProductCutout(product.pid) || configuredImage,
          gallery,
          description: product.description || '',
          keyFeatures: product.keyFeatures || [],
          specs: hoverSpecsData,
          specIcons: hoverSpecIcons,
          quickHighlights: hover.map((h: any) => ({
            key: String(h.key || h.key_name || '').trim(),
            value: String(h.value ?? h.spec_value ?? '').trim(),
            icon: h.icon ? String(h.icon) : undefined,
          })).filter((h: any) => h.key && h.value),
          quickProductHighlightEnabled: product.quick_product_highlight_enabled !== false
            && product.quick_product_highlight_enabled !== 0
            && product.quick_product_highlight_enabled !== "0",
          detailedSpecs: product.detailed_specs || product.detailedSpecs || {},
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
      const matchCategory = selectedCategory === "all"
        || getCategoryFilterId(p.category_id) === getCategoryFilterId(selectedCategory)
        || getCategoryFilterId(p.category) === getCategoryFilterId(selectedCategory);
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

    // Priority mapping: lower numbers appear first
    const getProductPriority = (p: Product) => {
      const cat = (p.category_id ?? p.category ?? "").toString().toLowerCase();
      // Educational Smart TV / related TVs
      if (/tv|smarttv|television|interactive/.test(cat)) return 0;
      // Laptops
      if (/laptop|notebook/.test(cat)) return 1;
      // Tablets / Beepad
      if (/tablet|beepad|ipad/.test(cat)) return 2;
      // Smartwatches / sport / medical
      if (/watch|smartwatch|sport|medical/.test(cat)) return 3;
      return 4; // default
    };

    const getEducationalTvSize = (p: Product) => {
      const category = String(p.category || "").toLowerCase();
      if (!/educational\s*smart\s*tv|smart\s*tv/.test(category)) return null;
      const match = String(p.name || "").match(/(\d+(?:\.\d+)?)\s*(?:inch(?:es)?|\")/i);
      return match ? Number(match[1]) : null;
    };

    // First sort by priority, then by selected sort
    arr.sort((a, b) => {
      const pa = getProductPriority(a);
      const pb = getProductPriority(b);
      if (pa !== pb) return pa - pb;

      // Keep Educational Smart TVs in customer-friendly size order:
      // 65, 75, 86, 105, regardless of the API insertion order.
      const tvSizeA = getEducationalTvSize(a);
      const tvSizeB = getEducationalTvSize(b);
      if (tvSizeA !== null && tvSizeB !== null && tvSizeA !== tvSizeB) {
        return tvSizeA - tvSizeB;
      }

      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;

      return 0;
    });

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
      <section className="bg-[#000000] px-4 py-16 md:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-[1440px]">
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
