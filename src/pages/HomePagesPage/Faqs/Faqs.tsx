"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  MessageCircle, 
  ChevronDown, 
  BookOpen, 
  X, 
  Watch, 
  Laptop, 
  Tablet, 
  Tv, 
  Server, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const data = [
  {
    id: 1,
    title: "How do I connect my Smart Watch?",
    explanation: "Enable Bluetooth → open companion app → pair device.",
    device: "Smart Watch",
    category: "Connectivity"
  },
  {
    id: 2,
    title: "How to reset my Laptop?",
    explanation: "Settings → System → Recovery → Reset PC (backup first).",
    device: "Laptop",
    category: "System"
  },
  {
    id: 3,
    title: "Why is my Tablet slow?",
    explanation: "Clear cache, restart, remove unused apps or factory reset.",
    device: "Tablet",
    category: "Performance"
  },
  {
    id: 4,
    title: "How do I cast my phone to my TV?",
    explanation: "TV must support mirroring OR use Chromecast/Fire Stick.",
    device: "Interactive Smart TV",
    category: "Connectivity"
  },
];

export default function FAQs() {
  const devices = [
    { id: "All", name: "All", count: data.length },
    { id: "Smart Watch", name: "Smart Watch", count: data.filter(d => d.device === "Smart Watch").length },
    { id: "Laptop", name: "Laptop", count: data.filter(d => d.device === "Laptop").length },
    { id: "Tablet", name: "Tablet", count: data.filter(d => d.device === "Tablet").length },
    { id: "Interactive Smart TV", name: "Interactive Smart TV", count: data.filter(d => d.device === "Interactive Smart TV").length },
  ];

  const [active, setActive] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState("All");
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 5;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filtered = useMemo(
    () =>
      data.filter(
        (f) =>
          (device === "All" || f.device === device) &&
          f.title.toLowerCase().includes(search.toLowerCase())
      ),
    [search, device]
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, device]);

  // Helper function to conditionally wrap with motion.div
  const MotionWrapper = ({ 
    children, 
    variants, 
    className = "", 
    initial = false,
    animate = false 
  }: any) => {
    if (isMobile) {
      return <div className={className}>{children}</div>;
    }
    
    return (
      <motion.div
        className={className}
        variants={variants}
        initial={initial ? "hidden" : false}
        animate={animate ? "visible" : false}
      >
        {children}
      </motion.div>
    );
  };

  // Helper for FAQ items
  const FAQItemWrapper = ({ 
    children, 
    f, 
    index 
  }: any) => {
    if (isMobile) {
      return (
        <div className="beesee-card-content cursor-pointer transition-all duration-300 hover:border-[var(--beesee-gold)]/40 hover:shadow-lg">
          {children}
        </div>
      );
    }
    
    return (
      <motion.div
        key={f.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
        className="beesee-card-content cursor-pointer transition-all duration-300 hover:border-[var(--beesee-gold)]/40 hover:shadow-lg"
      >
        {children}
      </motion.div>
    );
  };

  // Animation variants (desktop only)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getDeviceIcon = (deviceId: string) => {
    const icons: Record<string, React.ReactNode> = {
      All: <Server className="w-3.5 h-3.5" />,
      "Smart Watch": <Watch className="w-3.5 h-3.5" />,
      Laptop: <Laptop className="w-3.5 h-3.5" />,
      Tablet: <Tablet className="w-3.5 h-3.5" />,
      "Interactive Smart TV": <Tv className="w-3.5 h-3.5" />,
    };
    return icons[deviceId] || <Server className="w-3.5 h-3.5" />;
  };

  return (
    <section
      className="relative overflow-hidden pt-24 sm:pt-28 md:pt-36 lg:pt-48 pb-28 sm:pb-36 md:pb-44 lg:pb-56 px-4 sm:px-6 md:px-10 lg:px-12"
      style={{
        backgroundImage: "url('/live-background/randomBg2Gray.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* GOLD + BLACK OVERLAY */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.85) 5%,
              rgba(0,0,0,0.55) 25%,
              rgba(0,0,0,0.25) 40%,
              rgba(0,0,0,0.08) 60%,
              rgba(0,0,0,0) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(253,204,0,0.35) 0%,
              rgba(253,204,0,0.25) 15%,
              rgba(253,204,0,0.15) 35%,
              rgba(253,204,0,0.08) 55%,
              rgba(253,204,0,0.03) 75%,
              rgba(253,204,0,0) 100%
            ),
            linear-gradient(
              to top,
              rgba(0,0,0,1) 0%,
              rgba(0,0,0,0.85) 5%,
              rgba(0,0,0,0.55) 25%,
              rgba(0,0,0,0.25) 40%,
              rgba(0,0,0,0.08) 78%,
              rgba(0,0,0,0) 100%
            )
          `,
        }}
      />

      {/* MAIN CONTENT - NO ANIMATION ON MOBILE */}
      {isMobile ? (
        <div className="relative z-10">
          {/* TITLE */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="bee-title-md text-[var(--beesee-gold)] text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-md">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="bee-body mt-3 sm:mt-4 text-xs sm:text-sm md:text-base opacity-90 max-w-xl mx-auto">
              Discover answers to common inquiries about our products and services.
            </p>
          </div>

          {/* SEARCH */}
          <div className="max-w-xl mx-auto mt-6 sm:mt-8 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7B897]/70 pointer-events-none"
            />
            <input
              placeholder="Search keyword, issue or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-default w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm !bg-black/40 !backdrop-blur-xl !border-[#C7B897]/50 focus:!border-[var(--beesee-gold)] text-white placeholder:text-[#C7B897]/60"
            />
          </div>

          {/* CATEGORY FILTER */}
          <div className="mt-8 sm:mt-10 w-full">
            {/* DESKTOP */}
            <div className="hidden md:flex justify-center gap-2 flex-wrap">
              {devices.map((d) => {
                const isActive = device === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id)}
                    className={`
                      flex items-center gap-3
                      px-4 py-2.5 rounded-full
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20 border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)]' 
                        : 'bg-black/30 border border-[#383120] text-[#C7B897] hover:border-[var(--beesee-gold)]/30 hover:text-[var(--beesee-gold)]/80'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20' 
                        : 'bg-[#C7B897]/10'
                      }
                    `}>
                      {getDeviceIcon(d.id)}
                    </div>
                    <span className="text-sm font-medium">
                      {d.name}
                    </span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/30 text-[var(--beesee-gold)]' 
                        : 'bg-[#C7B897]/20 text-[#C7B897]'
                      }
                    `}>
                      {d.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* MOBILE */}
            <div className="grid grid-cols-2 gap-2 md:hidden mt-4">
              {devices.map((d) => {
                const isActive = device === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id)}
                    className={`
                      flex items-center gap-2
                      px-3 py-2 rounded-xl
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20 border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)]' 
                        : 'bg-black/30 border border-[#383120] text-[#C7B897]'
                      }
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-md
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20' 
                        : 'bg-[#C7B897]/10'
                      }
                    `}>
                      {getDeviceIcon(d.id)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium truncate max-w-[100px]">
                        {d.name}
                      </span>
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-full mt-0.5
                        ${isActive 
                          ? 'bg-[var(--beesee-gold)]/30 text-[var(--beesee-gold)]' 
                          : 'bg-[#C7B897]/20 text-[#C7B897]'
                        }
                      `}>
                        {d.count}
                    </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ LIST - STATIC ON MOBILE */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6">
            {filtered.map((f, i) => (
              <div
                key={f.id}
                className="beesee-card-content cursor-pointer transition-all duration-300 hover:border-[var(--beesee-gold)]/40 hover:shadow-lg"
                onClick={() => setActive(active === f.id ? null : f.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="bee-title-sm text-white text-left text-sm sm:text-base md:text-lg">
                    {f.title}
                  </h3>
                  <div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        active === f.id ? "rotate-180 text-[var(--beesee-gold)]" : "text-[#C7B897]"
                      }`}
                    />
                  </div>
                </div>
                
                {active === f.id && (
                  <div className="mt-4">
                    <div className="bg-black/25 rounded-lg p-4 sm:p-5 border border-[var(--beesee-gold)]/20">
                      <p className="bee-body text-sm sm:text-[15px] leading-relaxed text-white/95">
                        {f.explanation}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--beesee-gold)]/10">
                        <span className="px-3 py-1 rounded-full bg-[var(--beesee-gold)]/15 text-[var(--beesee-gold)] text-xs font-medium">
                          {f.device}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs">
                          {f.category}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* NO RESULTS */}
          {filtered.length === 0 && (
            <div className="text-center py-12 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 mx-auto text-[#C7B897]/50 mb-4" />
              <h3 className="bee-title-sm text-white/70 mb-2">No results found</h3>
              <p className="bee-body text-[#C7B897]/60">
                Try a different search term or browse all categories
              </p>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP WITH ANIMATIONS */
        <motion.div 
          className="relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* TITLE */}
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <h1 className="bee-title-md text-[var(--beesee-gold)] text-xl sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-md">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="bee-body mt-3 sm:mt-4 text-xs sm:text-sm md:text-base opacity-90 max-w-xl mx-auto">
              Discover answers to common inquiries about our products and services.
            </p>
          </motion.div>

          {/* SEARCH */}
          <motion.div variants={itemVariants} className="max-w-xl mx-auto mt-6 sm:mt-8 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7B897]/70 pointer-events-none"
            />
            <input
              placeholder="Search keyword, issue or device..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-default w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm !bg-black/40 !backdrop-blur-xl !border-[#C7B897]/50 focus:!border-[var(--beesee-gold)] text-white placeholder:text-[#C7B897]/60"
            />
          </motion.div>

          {/* CATEGORY FILTER */}
          <motion.div variants={itemVariants} className="mt-8 sm:mt-10 w-full">
            {/* DESKTOP */}
            <div className="hidden md:flex justify-center gap-2 flex-wrap">
              {devices.map((d) => {
                const isActive = device === d.id;
                return (
                  <motion.button
                    key={d.id}
                    onClick={() => setDevice(d.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-3
                      px-4 py-2.5 rounded-full
                      transition-all duration-300
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20 border border-[var(--beesee-gold)]/40 text-[var(--beesee-gold)]' 
                        : 'bg-black/30 border border-[#383120] text-[#C7B897] hover:border-[var(--beesee-gold)]/30 hover:text-[var(--beesee-gold)]/80'
                      }
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/20' 
                        : 'bg-[#C7B897]/10'
                      }
                    `}>
                      {getDeviceIcon(d.id)}
                    </div>
                    <span className="text-sm font-medium">
                      {d.name}
                    </span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs
                      ${isActive 
                        ? 'bg-[var(--beesee-gold)]/30 text-[var(--beesee-gold)]' 
                        : 'bg-[#C7B897]/20 text-[#C7B897]'
                      }
                    `}>
                      {d.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* FAQ LIST WITH ANIMATIONS */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              {filtered.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                  className="beesee-card-content cursor-pointer transition-all duration-300 hover:border-[var(--beesee-gold)]/40 hover:shadow-lg"
                  onClick={() => setActive(active === f.id ? null : f.id)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="bee-title-sm text-white text-left text-sm sm:text-base md:text-lg">
                      {f.title}
                    </h3>
                    <motion.div
                      animate={{ rotate: active === f.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown
                        size={18}
                        className={active === f.id ? "text-[var(--beesee-gold)]" : "text-[#C7B897]"}
                      />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {active === f.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="bg-black/25 rounded-lg p-4 sm:p-5 border border-[var(--beesee-gold)]/20 mt-4">
                          <p className="bee-body text-sm sm:text-[15px] leading-relaxed text-white/95">
                            {f.explanation}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--beesee-gold)]/10">
                            <span className="px-3 py-1 rounded-full bg-[var(--beesee-gold)]/15 text-[var(--beesee-gold)] text-xs font-medium">
                              {f.device}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-xs">
                              {f.category}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* NO RESULTS */}
          {filtered.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12 max-w-md mx-auto"
            >
              <BookOpen className="w-12 h-12 mx-auto text-[#C7B897]/50 mb-4" />
              <h3 className="bee-title-sm text-white/70 mb-2">No results found</h3>
              <p className="bee-body text-[#C7B897]/60">
                Try a different search term or browse all categories
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* CHAT BUTTON */}
      {isMobile ? (
        <button
          onClick={() => setModal(true)}
          className="beesee-button beesee-button--small fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[98] shadow-xl"
        >
          <MessageCircle size={16} />
          Chat
        </button>
      ) : (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(253, 204, 0, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModal(true)}
          className="beesee-button beesee-button--small fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[98] shadow-xl"
        >
          <MessageCircle size={16} />
          Chat
        </motion.button>
      )}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[99] px-4" onClick={() => setModal(false)}>
          {isMobile ? (
            <div className="beesee-card-content max-w-md w-full p-6 sm:p-8 relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setModal(false)}
                className="absolute right-4 top-4 text-[#C7B897] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <h3 className="bee-title-sm text-[var(--beesee-gold)] text-center mb-4">
                ASK A QUESTION
              </h3>
              <div className="space-y-3">
                <input className="input-default" placeholder="Your Name" />
                <input className="input-default" placeholder="Your Email" />
                <textarea
                  rows={4}
                  className="input-default resize-none"
                  placeholder="Enter your question..."
                />
                <button className="beesee-button mt-2 w-full">Submit</button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="beesee-card-content max-w-md w-full p-6 sm:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setModal(false)}
                className="absolute right-4 top-4 text-[#C7B897] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <h3 className="bee-title-sm text-[var(--beesee-gold)] text-center mb-4">
                ASK A QUESTION
              </h3>
              <div className="space-y-3">
                <input className="input-default" placeholder="Your Name" />
                <input className="input-default" placeholder="Your Email" />
                <textarea
                  rows={4}
                  className="input-default resize-none"
                  placeholder="Enter your question..."
                />
                <button className="beesee-button mt-2 w-full">Submit</button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}