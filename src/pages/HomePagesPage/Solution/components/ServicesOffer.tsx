import React from "react";
import { 
  BookOpen, 
  BatteryCharging, 
  Laptop, 
  Watch 
} from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    title: "School Process",
    description:
      "Streamline enrollment, grading, and administration with smart digital tools designed for schools and universities.",
    icon: BookOpen,
  },
  {
    title: "Charging Station",
    description:
      "Optimize your operations with scalable business systems that improve efficiency, collaboration, and growth.",
    icon: BatteryCharging,
  },
  {
    title: "Premium Laptop",
    description:
      "High-performance laptops crafted for professionals and creators with elegant design and powerful specs.",
    icon: Laptop,
  },
  {
    title: "Smart Accessories",
    description:
      "Enhance your digital lifestyle with stylish, smart, and functional accessories built for everyday use.",
    icon: Watch,
  },
];

const ServicesOffer = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
      id="services"
    >
      
      {/* ===============================
          VIDEO BACKGROUND
      =============================== */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/live-background/holo4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#000000] opacity-70"></div>
        
        {/* Animated grid overlay for depth */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: `linear-gradient(#FDCC00 1px, transparent 1px), 
                                linear-gradient(90deg, #FDCC00 1px, transparent 1px)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* ===============================
          CONTENT CONTAINER
      =============================== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        
        {/* ===============================
            SECTION HEADER (MATCHING PRODUCTS HUB STRUCTURE)
        =============================== */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Sub Heading First - Georgia (like PRODUCT UNIVERSE) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ fontFamily: "Georgia, serif" }}
            className="text-[#FDCC00]/80 text-sm md:text-base tracking-[0.3em] uppercase mb-4"
          >
            Excellence in Every Solution
          </motion.div>

          {/* Main Heading - Bebas Neue */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="font-bebas text-[#FDCC00] 
                       text-5xl md:text-7xl lg:text-8xl 
                       tracking-wide leading-tight mb-6"
          >
            SERVICES WE OFFER
          </motion.h2>

          {/* Body Text - Segoe UI */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{ fontFamily: "Segoe UI, sans-serif" }}
            className="text-lg md:text-xl lg:text-2xl text-[#C7B897] 
                       leading-relaxed max-w-3xl mx-auto font-medium"
          >
            Discover cutting-edge devices and solutions designed to elevate 
            the way you connect, present, and inspire.
          </motion.p>
        </motion.div>

        {/* ===============================
            SERVICE CARDS GRID
        =============================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: index * 0.15,
                }}
              >
                {/* Card Container with glass morphism */}
                <div className="relative h-full bg-gradient-to-br from-white/10 to-white/5 
                               backdrop-blur-md border border-[#FDCC00]/20
                               rounded-2xl p-8 
                               shadow-lg shadow-black/20
                               hover:shadow-2xl hover:shadow-[#FDCC00]/30
                               transition-all duration-500
                               hover:border-[#FDCC00]/50
                               hover:-translate-y-2
                               flex flex-col items-center text-center min-h-[380px]">
                  
                  {/* Gradient glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 
                                 group-hover:opacity-100 transition-opacity duration-500
                                 bg-gradient-to-br from-[#FDCC00]/10 via-transparent to-[#FFD700]/10
                                 pointer-events-none">
                  </div>

                  {/* Icon Container */}
                  <motion.div
                    className="relative mb-8 p-5 rounded-full 
                               bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10
                               border-2 border-[#FDCC00]/30
                               group-hover:scale-110 group-hover:rotate-6
                               transition-all duration-500"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="w-12 h-12 text-[#FDCC00]" />
                    
                    {/* Pulsing glow */}
                    <div className="absolute inset-0 rounded-full bg-[#FDCC00]/20 
                                   blur-xl opacity-0 group-hover:opacity-100 
                                   transition-opacity duration-500 -z-10">
                    </div>
                  </motion.div>

                  {/* Title - Bebas Neue */}
                  <h3 
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    className="text-2xl md:text-3xl tracking-wide text-white mb-4
                              group-hover:text-[#FDCC00] transition-colors duration-300"
                  >
                    {service.title}
                  </h3>

                  {/* Description - Segoe UI */}
                  <p 
                    style={{ fontFamily: "Segoe UI, sans-serif" }}
                    className="text-sm md:text-base text-[#C7B897]/80 leading-relaxed
                              group-hover:text-[#C7B897]/100 transition-colors duration-300
                              flex-grow"
                  >
                    {service.description}
                  </p>

                  {/* Hover indicator */}
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-[#FDCC00] 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileInView={{ x: 0 }}
                  >
                    <span 
                      style={{ fontFamily: "Georgia, serif" }}
                      className="text-sm font-light tracking-wider uppercase"
                    >
                      Learn More
                    </span>
                    <motion.svg 
                      className="w-4 h-4"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      width="16" 
                      height="16" 
                      viewBox="0 0 20 20" 
                      fill="none"
                    >
                      <path 
                        d="M4 10H16M16 10L11 5M16 10L11 15" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </motion.div>

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 
                                 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/50 
                                 rounded-tl-2xl transition-all duration-500"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 
                                 border-[#FDCC00]/0 group-hover:border-[#FDCC00]/50 
                                 rounded-br-2xl transition-all duration-500"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ServicesOffer;