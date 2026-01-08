import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertColor } from '@mui/material/Alert';
import Snackbar from '../../../components/feedback/Snackbar';
import {
  Search,
  MessageCircle,
  ChevronDown,
  BookOpen,
  PlusCircle,
  Server,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchFaqsAll, fetchAllDevices } from '../../../services/Technician/faqsServices';
import { useQuery } from '@tanstack/react-query';

interface FaqItem {
  id: number;
  title: string;
  explanation: string;
  device: string;
  category: string;
}

const FAQs = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [snackBarType, setSnackBarType] = useState<AlertColor>('success');

  const { data: mockFaqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => fetchFaqsAll(),
  });

  const { data: devicesData = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => fetchAllDevices(),
  });

  const devices = [
    'All',
    ...(devicesData.data
      ? devicesData.data.map((device: any) => device.name)
      : []),
  ];

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesDevice =
        selectedDevice === 'All' ||
        faq.category.toLowerCase() === selectedDevice.toLowerCase();

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        faq.title.toLowerCase().includes(search) ||
        faq.explanation.toLowerCase().includes(search) ||
        faq.device.toLowerCase().includes(search) ||
        faq.category.toLowerCase().includes(search);

      return matchesDevice && matchesSearch;
    });
  }, [faqs, selectedDevice, searchTerm]);

  useEffect(() => {
    if (mockFaqs.data) setFaqs(mockFaqs.data);
  }, [mockFaqs.data]);

  useEffect(() => {
    document.title = 'Faqs - Beesee Global Technology Inc;';
  }, []);

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
  }, [filteredFaqs]);

  const getDeviceIcon = () => {
    return <Server className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/live-background/randomBg2Gray.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient Overlays */}
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
            
            .category-pill:active {
              transform: scale(0.98);
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

        <Snackbar
          open={showAlert}
          type={snackBarType}
          message={message}
          onClose={() => setShowAlert(false)}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-default w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm !bg-black/40 !backdrop-blur-xl !border-[#C7B897]/50 focus:!border-[var(--beesee-gold)] text-white placeholder:text-[#C7B897]/60"
            />
          </div>

          {/* CATEGORY FILTER - PRODUCT HUB EXACT DESIGN */}
          <div className="mt-8 sm:mt-10 w-full">
            {/* DESKTOP */}
            <div className="hidden md:flex justify-center gap-2 flex-wrap">
              {devices.map((device) => {
                const isActive = selectedDevice === device;
                return (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`category-pill ${isActive ? "active" : ""}`}
                  >
                    <div className="category-pill-icon">
                      {getDeviceIcon()}
                    </div>
                    <span className="category-pill-name">
                      {device}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* MOBILE */}
            <div className="grid grid-cols-2 gap-2 md:hidden mt-4">
              {devices.map((device) => {
                const isActive = selectedDevice === device;
                return (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`category-pill ${isActive ? "active" : ""}`}
                  >
                    <div className="category-pill-icon">
                      {getDeviceIcon()}
                    </div>
                    <span className="category-pill-name">
                      {device}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ LIST */}
          <div className="max-w-4xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-black/30 border border-[#C7B897]/20">
                  <BookOpen className="text-[#C7B897]" />
                </div>
                <p className="bee-body">No FAQs Found.</p>
              </div>
            ) : (
              filteredFaqs.map((f, i) => (
                <div key={f.id}>
                  <div className="beesee-card-content cursor-pointer transition hover:shadow-lg">
                    <div
                      onClick={() => setActive(active === f.id ? null : f.id)}
                    >
                      <h3 className="bee-title-sm text-white text-left text-sm sm:text-base md:text-lg flex justify-between items-center">
                        {f.title}
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${
                            active === f.id ? "rotate-180 text-[var(--beesee-gold)]" : "text-[#C7B897]"
                          }`}
                        />
                      </h3>
                    </div>
                    {active === f.id && (
                      <div className="mt-4 opacity-100">
                        <div className="bg-black/25 rounded-lg p-4 sm:p-5 border border-[var(--beesee-gold)]/20">
                          <p className="bee-body text-sm sm:text-[15px] leading-relaxed !text-white">
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
                </div>
              ))
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
            <p className="bee-body mb-6">
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