"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, MessageCircle, ChevronDown, BookOpen, X, Watch, Laptop, Tablet, Tv, Server, ChevronLeft, ChevronRight } from "lucide-react";

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
  const itemsPerPage = 5;

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

  /* Scroll fade animation */
  const refs = useRef<HTMLDivElement[]>([]);
  const [visible, setVisible] = useState<boolean[]>([]);

  useEffect(() => {
    const obs = refs.current.map((el, i) => {
      if (!el) return null;
      const ob = new IntersectionObserver(
        (e) => {
          if (e[0].isIntersecting) {
            setVisible((v) => {
              const arr = [...v];
              arr[i] = true;
              return arr;
            });
          }
        },
        { threshold: 0.25 }
      );
      ob.observe(el);
      return ob;
    });
    return () => obs.forEach((o) => o?.disconnect());
  }, [paginatedData]);

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
      <style>{`
        /* PRODUCT HUB CATEGORY STYLES - EXPLICIT FOR FAQ */
        .category-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(56, 49, 32, 0.3);
          border: 1px solid #383120;
          border-radius: 50px;
          color: #C7B897;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          backdrop-filter: blur(8px);
          white-space: nowrap;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .category-pill::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(253, 204, 0, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }

        .category-pill:hover::before {
          left: 100%;
        }

        .category-pill:hover {
          background: rgba(253, 204, 0, 0.1);
          border-color: #FDCC00;
          color: #FDCC00;
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(253, 204, 0, 0.2);
        }

        .category-pill.active {
          background: rgba(253, 204, 0, 0.15);
          border-color: #FDCC00;
          color: #FDCC00;
          box-shadow: 0 4px 12px rgba(253, 204, 0, 0.15);
        }

        .category-pill.active::before {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(253, 204, 0, 0.4),
            transparent
          );
        }

        .category-pill-icon {
          width: 28px;
          height: 28px;
          background: rgba(199, 184, 151, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .category-pill.active .category-pill-icon {
          background: rgba(253, 204, 0, 0.2);
        }

        .category-pill:hover .category-pill-icon {
          background: rgba(253, 204, 0, 0.15);
          transform: scale(1.05);
        }

        .category-pill-name {
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
          position: relative;
          z-index: 1;
        }

        .category-pill-count {
          font-size: 0.7rem;
          background: rgba(199, 184, 151, 0.2);
          color: #C7B897;
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          min-width: 24px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .category-pill.active .category-pill-count {
          background: rgba(253, 204, 0, 0.3);
          color: #FDCC00;
        }

        .category-pill:hover .category-pill-count {
          background: rgba(253, 204, 0, 0.2);
          color: #FDCC00;
          transform: scale(1.05);
        }

        /* SEARCH CONTAINER */
        .search-filters-container {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: 1px solid #383120;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .search-input-wrapper {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          background: #000000;
          border: 2px solid #383120;
          border-radius: 12px;
          padding: 1rem 1rem 1rem 3rem;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #FDCC00;
          box-shadow: 0 0 0 3px rgba(253, 204, 0, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #C7B897;
          pointer-events: none;
        }

        /* PAGINATION */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(56, 49, 32, 0.3);
          border: 1px solid #383120;
          border-radius: 8px;
          color: #C7B897;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(253, 204, 0, 0.1);
          border-color: #FDCC00;
          color: #FDCC00;
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 0.75rem;
          background: rgba(56, 49, 32, 0.3);
          border: 1px solid #383120;
          border-radius: 8px;
          color: #C7B897;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .pagination-page:hover {
          background: rgba(253, 204, 0, 0.1);
          border-color: #FDCC00;
          color: #FDCC00;
        }

        .pagination-page.active {
          background: rgba(253, 204, 0, 0.15);
          border-color: #FDCC00;
          color: #FDCC00;
          font-weight: 700;
        }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .category-pill {
            flex-direction: row;
            padding: 0.325rem 0.5rem;
            gap: 0.4rem;
            text-align: center;
            min-height: 0;
            justify-content: center;
            align-items: center;
            font-size: 0.8rem;
          }
          
          .category-pill-icon {
            margin-bottom: 0;
            width: 22px;
            height: 22px;
          }
          
          .category-pill-name {
            font-size: 0.75rem;
            line-height: 1;
            max-width: 8rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .category-pill-count {
            font-size: 0.6rem;
            padding: 0.12rem 0.35rem;
            margin-left: 0.25rem;
          }
          
          .category-pill:active {
            transform: scale(0.98);
          }

          .search-filters-container {
            padding: 1rem;
          }

          .search-input {
            padding: 0.875rem 0.875rem 0.875rem 2.5rem;
            font-size: 0.875rem;
          }

          .search-icon {
            left: 0.875rem;
          }

          .pagination-btn, .pagination-page {
            width: 36px;
            height: 36px;
            min-width: 36px;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .category-pill {
            padding: 0.4rem 0.4rem;
            min-height: 68px;
          }

          .category-pill-icon {
            width: 20px;
            height: 20px;
          }

          .category-pill-name {
            font-size: 0.6rem;
          }
        }
      `}</style>

      {/* RESTORED GOLD + BLACK OVERLAY */}
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

        {/* CATEGORY FILTER - PRODUCT HUB EXACT DESIGN */}
        <div className="mt-8 sm:mt-10 w-full">
          {/* DESKTOP */}
          <div className="hidden md:flex justify-center gap-2 flex-wrap">
            {devices.map((d) => {
              const isActive = device === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className={`category-pill ${isActive ? "active" : ""}`}
                >
                  <div className="category-pill-icon">
                    {getDeviceIcon(d.id)}
                  </div>
                  <span className="category-pill-name">
                    {d.name}
                  </span>
                  <span className="category-pill-count">
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
                  className={`category-pill ${isActive ? "active" : ""}`}
                >
                  <div className="category-pill-icon">
                    {getDeviceIcon(d.id)}
                  </div>
                  <span className="category-pill-name">
                    {d.name}
                  </span>
                  <span className="category-pill-count">
                    {d.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6">
          {filtered.map((f, i) => (
            <div
              key={f.id}
              ref={(el) => el && (refs.current[i] = el)}
              className={`
                transition-all duration-700 ease-out
                ${visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}
            >
              <div
                className="beesee-card-content cursor-pointer transition hover:shadow-lg"
                onClick={() => setActive(active === f.id ? null : f.id)}
              >
                <h3 className="bee-title-sm text-white text-left text-sm sm:text-base md:text-lg flex justify-between items-center">
                  {f.title}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      active === f.id ? "rotate-180 text-[var(--beesee-gold)]" : "text-[#C7B897]"
                    }`}
                  />
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    active === f.id ? "max-h-64 mt-4" : "max-h-0"
                  }`}
                >
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT BUTTON */}
      <button
        onClick={() => setModal(true)}
        className="beesee-button beesee-button--small fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[98] shadow-xl"
      >
        <MessageCircle size={16} />
        Chat
      </button>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-[99] px-4">
          <div className="beesee-card-content max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setModal(false)}
              className="absolute right-4 top-4 text-[#C7B897] hover:text-white"
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
        </div>
      )}
    </section>
  );
}