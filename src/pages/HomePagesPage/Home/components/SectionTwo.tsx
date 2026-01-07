import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { CircuitBoard, Briefcase, Laptop, ArrowRight } from "lucide-react";

/* MOCK IMAGES */
const honey1 = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80";
const honey10 = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80";
const honey10BW = "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80&sat=-100";
const honey5 = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80";
const honey5BW = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&sat=-100";
const honey2 = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80";
const honey2BW = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80&sat=-100";
const honey1BW = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&sat=-100";
const honey9 = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80";
const honey9BW = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&sat=-100";
const buildingBeeSeeImage = "/buildingBeesee1.png";

const images = [
  { bw: honey10BW, color: honey10 },
  { bw: honey5BW, color: honey5 },
  { bw: honey2BW, color: honey2 },
  { bw: honey1BW, color: honey1 },
  { bw: honey9BW, color: honey9 },
];

const UnifiedHomeSections: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent horizontal scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    }
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, [isMobile]);

  // Animation variants
  const textAnimation = {
    desktop: {
      left: { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } },
      right: { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } },
      up: { hidden: { opacity: 0, y: 80 }, visible: { opacity: 1, y: 0 } }
    },
    mobile: {
      left: { hidden: { opacity: 1, x: 0 }, visible: { opacity: 1, x: 0 } },
      right: { hidden: { opacity: 1, x: 0 }, visible: { opacity: 1, x: 0 } },
      up: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    }
  };

  const transition = isMobile ? { duration: 0 } : { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
  const cardTransition = isMobile ? { duration: 0 } : { duration: 1.0, ease: "easeOut" };

  // Section refs
  const section2LeftRef = useRef<HTMLDivElement>(null);
  const section2RightRef = useRef<HTMLDivElement>(null);
  const section3TitleRef = useRef<HTMLDivElement>(null);
  const section4LeftRef = useRef<HTMLDivElement>(null);
  const section4RightRef = useRef<HTMLDivElement>(null);

  // InView hooks - once: true for mobile, once: false for desktop (repeatable)
  const inView2Left = useInView(section2LeftRef, { once: isMobile, amount: 0.1 });
  const inView2Right = useInView(section2RightRef, { once: isMobile, amount: 0.1 });
  const inView3Title = useInView(section3TitleRef, { once: isMobile, amount: 0.1 });
  const inView4Left = useInView(section4LeftRef, { once: isMobile, amount: 0.1 });
  const inView4Right = useInView(section4RightRef, { once: isMobile, amount: 0.1 });

  const items = [
    {
      title: "FIELD EXPERTS",
      desc: "Our expertise spans ICT, STEM, Robotics, TechVoc, Wellness, Accounting, and Business Management—supported by years of hands-on industry experience.",
      icon: <CircuitBoard size={28} />,
    },
    {
      title: "DEVELOPER EXPERTS",
      desc: "We develop polished, impactful digital content that blends creativity, technical accuracy, and user-centered design.",
      icon: <Laptop size={28} />,
    },
    {
      title: "CAPACITY-BUILDING EXPERTS",
      desc: "We empower organizations through structured training, skills development, and capability-building programs.",
      icon: <Briefcase size={28} />,
    },
  ];

  // Get animation variants based on device
  const getTextVariants = (direction: 'left' | 'right' | 'up') => {
    return isMobile ? textAnimation.mobile[direction] : textAnimation.desktop[direction];
  };

  return (
    <div className="relative bg-[#000000] overflow-x-hidden w-full">
      {/* ================= SECTION TWO ================= */}
      <section className="scroll-section section-two relative min-h-[85vh] flex items-center z-10 overflow-hidden py-8 md:py-10 w-full">
        <div className="section-two-wrapper w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
          <div className="section-two-row grid lg:grid-cols-2 gap-10 items-center w-full">
            
            {/* LEFT TEXT BLOCK - No animation on mobile */}
            <motion.div
              ref={section2LeftRef}
              className="section-two-text w-full"
              initial="hidden"
              animate={inView2Left ? "visible" : "hidden"}
              variants={getTextVariants('left')}
              transition={transition}
            >
              <h2 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
                BEESEE GLOBAL 
                <br>
                </br>TECHNOLOGIES INC.
              </h2>

              <p className="bee-body text-[#e8e8e8] mt-4 leading-relaxed">
                 <i>BeeSee Global Technologies Inc.</i>, delivers scalable digital
                solutions backed by a dedicated team. With a strong presence
                and proven performance in Guam, USA, we provide strategic and
                highly adaptable system solutions.
                <br />
                <br />
                Our customized learning platforms—LMS, CMS, enterprise
                systems—are designed to help institutions and organizations
                build sustainable, future-ready infrastructures.
              </p>
            </motion.div>

            {/* RIGHT IMAGE BLOCK - Keep animation for images on all devices */}
            <motion.div
              ref={section2RightRef}
              className="section-two-image w-full"
              initial={{ opacity: 0, x: isMobile ? 0 : 100 }}
              animate={inView2Right ? { opacity: 1, x: 0 } : { opacity: isMobile ? 1 : 0, x: isMobile ? 0 : 100 }}
              transition={{ duration: isMobile ? 0.6 : 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="beesee-card-content section-two-card w-full"
                whileHover={{ 
                  scale: isMobile ? 1 : 1.03,
                  boxShadow: '0 0 40px rgba(253, 204, 0, 0.2)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.img
                  src={buildingBeeSeeImage}
                  alt="Building BeeSee"
                  className="w-full h-full object-cover rounded-2xl"
                  whileHover={{ scale: isMobile ? 1 : 1.05 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= SECTION THREE ================= */}
      <section className="scroll-section relative min-h-[85vh] flex items-center z-10 overflow-hidden py-10 md:py-12 px-6 md:px-10 lg:px-12 w-full">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/live-background/randomBg2.png')", 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* GOLD + BLACK FADE LAYERS */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(0, 0, 0, 1) 0%,
                rgba(0, 0, 0, 0.75) 5%,
                rgba(0, 0, 0, 0.35) 10%,
                rgba(0, 0, 0, 0) 15%,
                transparent 20%
              ),
              linear-gradient(
                to bottom,
                rgba(253, 204, 0, 0.35) 0%,
                rgba(253, 204, 0, 0.25) 15%,
                rgba(253, 204, 0, 0.15) 35%,
                rgba(253, 204, 0, 0.08) 55%,
                rgba(253, 204, 0, 0.03) 75%,
                rgba(253, 204, 0, 0.00) 100%
              ),
              linear-gradient(
                to top,
                rgba(0,0,0,1) 0%,
                rgba(0,0,0,0.85) 5%,
                rgba(0,0,0,0.55) 25%,
                rgba(0,0,0,0.25) 40%,
                rgba(0,0,0,0.08) 78%,
                rgba(0,0,0,0.00) 100%
              )
            `,
          }}
        />

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* TITLE - No animation on mobile */}
          <motion.div
            ref={section3TitleRef}
            initial="hidden"
            animate={inView3Title ? "visible" : "hidden"}
            variants={getTextVariants('up')}
            transition={transition}
            className="text-center mb-12"
          >
            <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
              SYSTEM TECHNOLOGY EXPERTS
            </h3>
            <p className="bee-body max-w-3xl mx-auto mt-4 text-[#C7B897]">
              BeeSee Global Technologies is a trusted provider of digital
              solutions, training programs, and industry-aligned content built
              for long-term growth.
            </p>
          </motion.div>

          {/* CARDS - No animation on mobile */}
          <div className="grid md:grid-cols-3 gap-8 w-full">
            {items.map((item, index) => {
              const cardRef = useRef<HTMLDivElement>(null);
              const inViewCard = useInView(cardRef, { once: isMobile, amount: 0.1 });

              return (
                <motion.div
                  key={index}
                  ref={cardRef}
                  initial="hidden"
                  animate={inViewCard ? "visible" : "hidden"}
                  variants={getTextVariants('up')}
                  transition={isMobile ? { duration: 0 } : { duration: 1.0, delay: index * 0.2, ease: "easeOut" }}
                  className="beesee-card-content card-glow p-6 w-full"
                  whileHover={{ 
                    y: isMobile ? 0 : -10,
                    boxShadow: '0 20px 60px rgba(253, 204, 0, 0.15)',
                  }}
                >
                  <div className="icon-wrap text-[var(--beesee-gold)] mb-3">{item.icon}</div>
                  <h4 className="beesee-card-content-title bee-title-sm text-[var(--beesee-gold)] mb-2">
                    {item.title}
                  </h4>
                  <p className="bee-body text-[#C7B897]/90">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= DIGITAL CONNECTION SECTION ================= */}
      <section className="scroll-section relative min-h-[85vh] flex items-center z-10 bg-[#000] text-white overflow-hidden py-10 md:py-12 w-full">
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-14 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* LEFT — CAROUSEL - Keep animation for images */}
          <motion.div
            ref={section4LeftRef}
            initial={{ opacity: 0, x: isMobile ? 0 : -100 }}
            animate={inView4Left ? { opacity: 1, x: 0 } : { opacity: isMobile ? 1 : 0, x: isMobile ? 0 : -100 }}
            transition={{ duration: isMobile ? 0.6 : 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl w-full"
            style={{ height: '360px' }}
          >
            <motion.div
              className="flex gap-4 absolute"
              animate={{
                x: [0, -1200],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[...images, ...images, ...images].map((img, i) => (
                <div 
                  key={i} 
                  className="relative w-64 h-96 flex-shrink-0 rounded-xl overflow-hidden group"
                  style={{ minWidth: '256px' }}
                >
                  <motion.img
                    src={img.bw}
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ filter: 'grayscale(100%)' }}
                    loading="lazy"
                  />
                  <motion.img
                    src={img.color}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — TEXT - No animation on mobile */}
          <motion.div
            ref={section4RightRef}
            initial="hidden"
            animate={inView4Right ? "visible" : "hidden"}
            variants={getTextVariants('right')}
            transition={transition}
            className="flex flex-col gap-5 md:gap-6 w-full"
          >
            <h2 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
              DIGITAL CONNECTION
            </h2>

            <p className="bee-body text-[#e8e8e8] mt-4 leading-relaxed">
                Affordable devices, seamless support, powerful networks, and intuitive softwares—everything you need in one connected ecosystem.
                <br />
                <br />
                <i>"Smart. Reliable. Accessible."</i>
              </p>

            <motion.button
              className="beesee-button beesee-button--small self-start flex items-center gap-3"
              onClick={() => navigate('/solution')}
              whileHover={{ 
                scale: isMobile ? 1 : 1.05,
                boxShadow: '0 0 30px rgba(253, 204, 0, 0.5)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              START HERE
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default UnifiedHomeSections;