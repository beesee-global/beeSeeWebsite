import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu, HardDrive, Database, Cloud, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

// Product type definition
interface Product {
  id: number;
  pid: string;
  name: string;
  tagline: string;
  category_id: string;
  category: string;
  image: string;
  specs: {
    cpu?: string;
    ram?: string;
    ssd?: string;
    storage?: string;
  };
}

// Category type
interface Category {
  id: string;
  name: string;
}

const ProductsHub: React.FC = () => {
  const navigate = useNavigate();

  // Demo data - API ready structure
  const demoProducts: Product[] = [
    {
      id: 1,
      pid: "P1001",
      name: "BEESEE LAPTOP X1",
      tagline: "Powerful performance, elegant design.",
      category_id: "laptops",
      category: "Laptops",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Intel i7 12th Gen",
        ram: "16GB DDR5",
        ssd: "1TB NVMe",
        storage: "Cloud Ready"
      }
    },
    {
      id: 2,
      pid: "P1002",
      name: "BEESEE LAPTOP G5",
      tagline: "Gaming redefined.",
      category_id: "laptops",
      category: "Laptops",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Intel i9 13th Gen",
        ram: "32GB DDR5",
        ssd: "2TB NVMe",
        storage: "2TB HDD"
      }
    },
    {
      id: 3,
      pid: "P1003",
      name: "BEESEE CONFERENCE DISPLAY",
      tagline: "Sharp visuals for presentations.",
      category_id: "displays",
      category: "Displays",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "ARM Cortex A73",
        ram: "4GB",
        ssd: "64GB eMMC",
        storage: "USB 3.0"
      }
    },
    {
      id: 4,
      pid: "P1004",
      name: "BEESEE SMARTWATCH S1",
      tagline: "Your health, reimagined.",
      category_id: "wearables",
      category: "Wearables",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Dual Core 1.2GHz",
        ram: "2GB",
        ssd: "16GB",
        storage: "Cloud Sync"
      }
    },
    {
      id: 5,
      pid: "P1005",
      name: "BEESEE SMARTWATCH S2",
      tagline: "Red edition for active lifestyle.",
      category_id: "wearables",
      category: "Wearables",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Quad Core 1.5GHz",
        ram: "3GB",
        ssd: "32GB",
        storage: "Cloud Sync"
      }
    },
    {
      id: 6,
      pid: "P1006",
      name: "BEESEE TABLET PRO",
      tagline: "Ultra slim, ultra bright.",
      category_id: "tablets",
      category: "Tablets",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Snapdragon 8 Gen 2",
        ram: "12GB",
        ssd: "512GB",
        storage: "MicroSD Support"
      }
    },
    {
      id: 7,
      pid: "P1007",
      name: "BEESEE MONITOR 4K",
      tagline: "Professional grade display.",
      category_id: "displays",
      category: "Displays",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "N/A",
        ram: "N/A",
        ssd: "N/A",
        storage: "N/A"
      }
    },
    {
      id: 8,
      pid: "P1008",
      name: "BEESEE ULTRABOOK Z1",
      tagline: "Lightweight powerhouse.",
      category_id: "laptops",
      category: "Laptops",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Intel i5 12th Gen",
        ram: "8GB DDR4",
        ssd: "512GB NVMe",
        storage: "Cloud Ready"
      }
    },
    {
      id: 9,
      pid: "P1009",
      name: "BEESEE FITNESS BAND",
      tagline: "Track every step.",
      category_id: "wearables",
      category: "Wearables",
      image: "/assets/images/productHub/p1.png",
      specs: {
        cpu: "Low Power MCU",
        ram: "512MB",
        ssd: "8GB",
        storage: "Cloud Sync"
      }
    }
  ];

  const categories: Category[] = [
    { id: "all", name: "All Products" },
    { id: "laptops", name: "Laptops" },
    { id: "displays", name: "Displays" },
    { id: "wearables", name: "Wearables" },
    { id: "tablets", name: "Tablets" }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Products - Beesee Global Technology Inc.";
  }, []);

  // Filter products
  const filteredProducts = demoProducts.filter((product) => {
    const matchCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    const matchSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Sort products
  let sortedProducts = [...filteredProducts];
  if (sortBy === "name-asc") {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "name-desc") {
    sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Pagination - 3 items per row, 2 rows per page = 6 items per page
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/live-background/coverVideo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black opacity-85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#FDCC00]/80 text-sm md:text-base tracking-[0.3em]"
            >
              BEESEE PRODUCTS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#FDCC00] text-5xl md:text-7xl lg:text-8xl tracking-wide font-bold"
            >
              EXPLORE OUR TECHNOLOGY
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-[#C7B897] leading-relaxed max-w-3xl mx-auto"
            >
              Discover cutting-edge devices designed to elevate the way you connect, present, and inspire.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters Bar */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C7B897] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg text-white placeholder-[#C7B897]/50 focus:outline-none focus:border-[#FDCC00] transition-colors"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg text-[#FDCC00] hover:bg-[#FDCC00]/10 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg space-y-4">
                    {/* Categories */}
                    <div>
                      <h3 className="text-[#FDCC00] font-semibold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedCategory === category.id
                                ? "bg-[#FDCC00] text-black"
                                : "bg-[#2a2a2a] text-[#C7B897] hover:bg-[#FDCC00]/20"
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h3 className="text-[#FDCC00] font-semibold mb-3">Sort By</h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-auto px-4 py-2 bg-[#2a2a2a] border border-[#FDCC00]/30 rounded-lg text-white focus:outline-none focus:border-[#FDCC00]"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-[#2a2a2a] text-[#C7B897] rounded-lg hover:bg-[#FDCC00]/20 transition-colors text-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-[#C7B897]">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
          </div>

          {/* Products Grid - 3 items per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {paginatedProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                onClick={() => navigate(`/product/${product.pid}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg text-[#FDCC00] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FDCC00]/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-[#FDCC00] text-black"
                        : "bg-[#1a1a1a] text-[#C7B897] border border-[#FDCC00]/30 hover:bg-[#FDCC00]/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-[#1a1a1a] border border-[#FDCC00]/30 rounded-lg text-[#FDCC00] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FDCC00]/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Product Card Component with Hover Specs
const ProductCard: React.FC<{ 
  product: Product; 
  index: number;
  onClick: () => void;
}> = ({ product, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const specIcons = {
    cpu: Cpu,
    ram: HardDrive,
    ssd: Database,
    storage: Cloud
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#FDCC00]/10 hover:border-[#FDCC00]/50 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-[#000000] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Specs Overlay on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="grid grid-cols-2 gap-6 w-full">
                {Object.entries(product.specs).map(([key, value], i) => {
                  const Icon = specIcons[key as keyof typeof specIcons];
                  return (
                    <motion.div
                      key={key}
                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex flex-col items-center text-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FDCC00]/10 border border-[#FDCC00]/30 flex items-center justify-center group-hover:bg-[#FDCC00]/20 transition-colors">
                        <Icon className="w-5 h-5 text-[#FDCC00]" />
                      </div>
                      <div>
                        <div className="text-[#FDCC00] text-[10px] uppercase tracking-widest mb-1 font-semibold">
                          {key}
                        </div>
                        <div className="text-white text-xs font-medium">
                          {value}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info - Name below image */}
      <div className="p-5 bg-[#0a0a0a]">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#FDCC00] transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[#C7B897] text-xs line-clamp-2">
          {product.tagline}
        </p>
      </div>

      {/* Subtle hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDCC00]/5 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
};

export default ProductsHub;