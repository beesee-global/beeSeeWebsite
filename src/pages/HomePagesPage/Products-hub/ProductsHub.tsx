import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CategoryFilter, { Category } from "./components/CategoryFilter";
import ImageSlider from "./components/ImageSlider";
import SearchAndFilters from "./components/SearchAndFilters";
import ProductGrid, { Product } from "./components/ProductGrid";
import HeroProducts from "../../HomePagesPage/Products-hub/components/HeroProduct";

import "../../../assets/css/Product.css";
import "../../../assets/css/MimicStyles.css";

/* ===========================
   UNIVERSAL FADE REVEAL
=========================== */
const FadeReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  /* ======================================================
       UI / PAGE RENDER
  ====================================================== */
  return (
    <div className="products-hub min-h-screen bg-[#000000]">

      {/* 🔥 NEW HERO SECTION */}
      <HeroProducts />


      {/* ===========================
         MAIN SECTION
      ============================ */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">

            {/* SEARCH & FILTERS */}
            <FadeReveal>
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

            {/* CATEGORY FILTER */}
            <FadeReveal>
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

            {/* RESULTS COUNT */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`results-${filteredProducts.length}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="text-[#C7B897] text-sm mt-6 mb-4"
              >
                Showing {paginatedProducts.length} of {filteredProducts.length} products
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "all" &&
                  ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
              </motion.p>
            </AnimatePresence>

            {/* GRID */}
            <FadeReveal>
              <ProductGrid
                products={paginatedProducts}
                onProductClick={(p) => navigate(`/product/${p.pid}`)}
              />
            </FadeReveal>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <FadeReveal>
                <div className="pagination-container">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`pagination-page ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </FadeReveal>
            )}

          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductsHub;
