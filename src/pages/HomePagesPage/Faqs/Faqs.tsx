import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertColor } from '@mui/material/Alert';
import Snackbar from '../../../components/feedback/Snackbar';
import '../../../assets/css/FAQs.css';
import DOMPurify from 'dompurify';
import {
  Search,
  MessageCircle,
  ChevronDown,
  BookOpen,
  PlusCircle,
  Server,
  Laptop,
  BatteryCharging,
  Tv,
  Tablet,
  Watch,
  Smartphone,
  Cpu,
  HardDrive,
  Monitor,
  Printer,
  Network,
  Camera,
  Headphones,
  Gamepad2,
  Speaker,
  Router,
  Keyboard,
  Mouse,
  SmartphoneCharging,
  TabletSmartphone,
  LaptopMinimal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFaqsAllPublic, fetchAllDevicesPublic } from '../../../services/Technician/faqsServices';
import { useQuery } from '@tanstack/react-query';
// import { useTawkTo } from '../../../hooks/useTawkTo';

interface FaqItem {
  id: number;
  title: string;
  explanation: string;
  device: string;
  category: string;
}

const FAQs = () => {
  //useTawkTo();
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const { data: mockFaqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => fetchFaqsAllPublic(),
  });

  const { data: devicesData = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => fetchAllDevicesPublic(),
  });

  const deviceNameMap: Record<string, string> = {
    'SmartTV': 'Interactive Smart TVs',
    'Laptop': 'Laptops',
    'Smartwatch': 'Wearables',
    'Tablet': 'Tablets',
  };

  const devices = [
    'All',
    ...(devicesData.data
      ? devicesData.data.map((device: any) => {
          // Apply name mapping - if exists in map, use mapped name, otherwise use original
          return deviceNameMap[device.name] || device.name;
        })
      : []),
  ];

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  
// ------------------------------
// 1️⃣ Add hook once (top-level of file)
// ------------------------------
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Only allow style attribute for text-align
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style') || '';
    const allowedStyles = style
      .split(";")
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.startsWith("text-align") ||
          s.startsWith("margin") ||
          s.startsWith("padding")
      )
      .join("; ");;

    if (allowedStyles) {
      node.setAttribute('style', allowedStyles);
    } else {
      node.removeAttribute('style');
    }
  }
});

  // Sanitize HTML function
  const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'ul', 'i', 'ol', 'li',
        'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'b',
        // Media & layout — required for image/video alignment support
        'div', 'img', 'video', 'source',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'src', 'alt', 'controls', 'type'],
      ALLOW_DATA_ATTR: false,
      // Allow data: URIs so base64-embedded images from the rich text editor render correctly
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  };

  // Helper function to get original backend name from display name
  const getOriginalDeviceName = (displayName: string): string => {
    if (displayName === 'All') return 'All';
    
    // Find the original name by looking up the value in the map
    const entry = Object.entries(deviceNameMap).find(([_, value]) => value === displayName);
    return entry ? entry[0] : displayName;
  };

  const filteredFaqs = useMemo(() => {
    const search = String(searchTerm || '').toLowerCase();
    const originalDeviceName = getOriginalDeviceName(selectedDevice);

    return faqs.filter((faq) => {
      // Convert all fields to lowercase for case-insensitive comparison
      const title = String(faq.title || '').toLowerCase();
      const explanation = String(faq.explanation || '').toLowerCase();
      const device = String(faq.device || '').toLowerCase();
      const category = String(faq.category || '').toLowerCase();

      // Check device/
      const matchesDevice =
        originalDeviceName === 'All' ||
        category === String(originalDeviceName || '').toLowerCase();

      // Check if search term appears in any field
      const matchesSearch =
        title.includes(search) ||
        explanation.includes(search) ||
        device.includes(search) ||
        category.includes(search);

      return matchesDevice && matchesSearch;
    });
  }, [faqs, selectedDevice, searchTerm]);
   
  // Calculate pagination
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFaqs = filteredFaqs.slice(startIndex, endIndex);

  useEffect(() => {
    if (mockFaqs.data) setFaqs(mockFaqs.data);
    console.log(mockFaqs.data)
  }, [mockFaqs.data]);

  useEffect(() => {
    document.title = 'Faqs - Beesee Global Technology Inc;';
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDevice, searchTerm]);

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
  }, [currentFaqs]);

  const getDeviceIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();

    // Kiosk/ATM Machines
    if (name.includes('kiosk') || name.includes('atm') || name.includes('self-service') || name.includes('terminal')) {
      return <Monitor className="w-4 h-4" />;
    }
    
    
    // Computers/Laptops
    if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook')) {
      return <LaptopMinimal className="w-4 h-4" />;
    }
    if (name.includes('desktop') || name.includes('pc') || name.includes('computer')) {
      return <Cpu className="w-4 h-4" />;
    }
    if (name.includes('monitor') || name.includes('display') || name.includes('screen')) {
      return <Monitor className="w-4 h-4" />;
    }
    
    // Mobile devices
    if (name.includes('smartphone') || name.includes('phone') || name.includes('iphone') || name.includes('android')) {
      return <SmartphoneCharging className="w-4 h-4" />;
    }
    if (name.includes('tablet') || name.includes('ipad')) {
      return <TabletSmartphone className="w-4 h-4" />;
    }
    if (name.includes('watch') || name.includes('wearable') || name.includes('smartwatch')) {
      return <Watch className="w-4 h-4" />;
    }
    
    // Entertainment
    if (name.includes('tv') || name.includes('television') || name.includes('smart tv')) {
      return <Tv className="w-4 h-4" />;
    }
    if (name.includes('camera') || name.includes('webcam') || name.includes('security')) {
      return <Camera className="w-4 h-4" />;
    }
    if (name.includes('speaker') || name.includes('sound') || name.includes('audio')) {
      return <Speaker className="w-4 h-4" />;
    }
    if (name.includes('headphone') || name.includes('earphone') || name.includes('headset')) {
      return <Headphones className="w-4 h-4" />;
    }
    if (name.includes('game') || name.includes('gaming') || name.includes('console')) {
      return <Gamepad2 className="w-4 h-4" />;
    }
    
    // Peripherals
    if (name.includes('printer') || name.includes('scanner') || name.includes('copier')) {
      return <Printer className="w-4 h-4" />;
    }
    if (name.includes('keyboard')) {
      return <Keyboard className="w-4 h-4" />;
    }
    if (name.includes('mouse') || name.includes('trackpad')) {
      return <Mouse className="w-4 h-4" />;
    }
    
    // Power/Battery
    if (name.includes('battery') || name.includes('power') || name.includes('charger')) {
      return <BatteryCharging className="w-4 h-4" />;
    }
    
    // Default for "All" and unknown devices
    if (deviceName === 'All') {
      return <Server className="w-4 h-4" />;
    }
    
    return <Cpu className="w-4 h-4" />;
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of FAQ list
    const faqList = document.querySelector('.faq-list-container');
    if (faqList) {
      faqList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => goToPage(Math.min(totalPages, currentPage + 1));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/faqsReal.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
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
      </div>

      {/* Content */}
      <section className="relative z-10 pt-18 sm:pt-28 md:pt-36 lg:pt-48 pb-28 sm:pb-36 md:pb-44 lg:pb-56 px-4 sm:px-6 md:px-10 lg:px-12">
        <Snackbar
          open={showAlert}
          type={snackBarType}
          message={message}
          onClose={() => setShowAlert(false)}
        />

        <div className="relative z-10">
          {/* TITLE */}
          <div className="text-center w-full max-w-[95vw] mx-auto">
            <h1 
              className="bee-title-lg text-[#FDCC00] leading-[0.9] tracking-wide select-none px-4 mb-6 text-center drop-shadow-md break-words"
            >
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="bee-body-lg mt-3 sm:mt-4 opacity-90 max-w-xl mx-auto">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-default w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm !bg-black/40 !backdrop-blur-xl !border-[#C7B897]/50 focus:!border-[var(--beesee-gold)] text-white placeholder:text-[#C7B897]/60"
            />
          </div>

          {/* CATEGORY FILTER */}
          <div className="mt-8 sm:mt-10 w-full">
            {/* DESKTOP */}
            <div className="hidden md:flex justify-center gap-4 flex-wrap">
              {devices.map((device) => {
                const isActive = selectedDevice === device;

                return (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`category-pill-advanced ${isActive ? "active" : ""}`}
                  >
                    <div className="category-pill-icon-advanced">
                      {getDeviceIcon(device)}
                    </div>

                    <span className="category-pill-name-advanced">
                      {device}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* MOBILE */}
            <div className="grid grid-cols-2 gap-3 md:hidden mt-4">
              {devices.map((device) => {
                const isActive = selectedDevice === device;

                return (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`category-pill-advanced ${isActive ? "active" : ""}`}
                  >
                    <div className="category-pill-icon-advanced">
                      {getDeviceIcon(device)}
                    </div>

                    <span className="category-pill-name-advanced">
                      {device}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ LIST */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6 faq-list-container">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-black/30 border border-[#C7B897]/20">
                  <BookOpen className="text-[#C7B897]" />
                </div>
                <p className="bee-body-lg">No FAQs Found.</p>
              </div>
            ) : (
              <>
                {currentFaqs.map((f, i) => (
                  <div key={f.id}>
                    {/* ENTIRE CARD CLICKABLE - WRAPPER DIV */}
                    <div 
                      className="beesee-card-content transition hover:shadow-lg cursor-pointer"
                      onClick={() => setActive(active === f.id ? null : f.id)}
                    >
                      <div className="faq-card-header">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="bee-title-sm text-white text-left flex-1">
                            {f.title}
                          </h3>
                          {/* Desktop: Tags + Arrow on right */}
                          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                            <div className="flex gap-1">
                              <span className="px-3 py-1 text-[var(--beesee-gold-soft)] text-xs font-medium">
                                {f.device}
                              </span>
                              <span className="px-3 py-1 text-white/70 text-xs">
                                {f.category}
                              </span>
                            </div>
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-300 flex-shrink-0 ${
                                active === f.id ? "rotate-180 text-[var(--beesee-gold)]" : "text-[#C7B897]"
                              }`}
                            />
                          </div>
                          {/* Mobile: Only Arrow */}
                          <div className="flex md:hidden items-center flex-shrink-0">
                            <ChevronDown
                              size={18}
                              className={`transition-transform duration-300 ${
                                active === f.id ? "rotate-180 text-[var(--beesee-gold)]" : "text-[#C7B897]"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      {active === f.id && (
                        <div className="mt-4 opacity-100">
                          <div className="bg-black/25 rounded-lg p-4 sm:p-5 border border-[var(--beesee-gold)]/20">
                            <p 
                              className="bee-body-lg leading-relaxed text-[#C7B897]/70"
                              style={{ textAlign: 'left', textAlignLast: 'left' }}
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(f.explanation) }}
                            />
                            {/* Mobile: Tags below explanation, left aligned */}
                            <div className="flex md:hidden gap-2 mt-4">
                              <span className="px-3 py-1 text-[var(--beesee-gold-soft)] text-xs font-medium">
                                {f.device}
                              </span>
                              <span className="px-3 py-1 text-white/70 text-xs ">
                                {f.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="mt-8 sm:mt-12 flex flex-col gap-4">
                    <div className="bee-body-sm text-[#C7B897] text-center sm:text-left pagination-info">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredFaqs.length)} of {filteredFaqs.length} questions
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
              </>
            )}
          </div>

          {/* CONTACT CTA */}
          <motion.div
            className="relative z-10 text-center max-w-3xl mx-auto mt-20 beesee-card-content"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-black/30 border border-[#C7B897]/20">
              <MessageCircle className="text-[var(--beesee-gold)]" />
            </div>
            <h3 className="bee-title-sm text-[var(--beesee-gold)] mb-4">
              Still Need Help?
            </h3>
            <p className="bee-body-lg mb-6">
              Can't find the answer? Our support team is here for you.
            </p>
            <button
              onClick={() => navigate('/customer-support')}
              className="beesee-button"
            >
              <PlusCircle size={18} />
              Customer Support
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;