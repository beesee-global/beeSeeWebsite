import React from "react";
import { motion } from "framer-motion";
import { PhoneCall, RotateCcw, Mail } from "lucide-react";

/* dummy image */
import image from '../../../../../public/assets/images/elleAssets/1.jpg';

const SupportServices: React.FC = () => {
  const features = [
    {
      icon: PhoneCall,
      title: "Call Local Support",
      desc: "Talk directly with our local support experts.",
    },
    {
      icon: RotateCcw,
      title: "Request a Callback",
      desc: "Leave a request and we'll reach out at your convenience.",
    },
    {
      icon: Mail,
      title: "Ask-A-Question (After Hours)",
      desc: "Send your query anytime we'll reply by email promptly.",
    },
  ];

  return (
    <section className="relative py-20 md:py-32 px-6 lg:px-8 bg-[#000000] overflow-hidden">
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FDCC00]/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFD700]/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Pre-heading - Georgia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ fontFamily: "Georgia, serif" }}
            className="text-[#FDCC00]/80 text-xs md:text-sm tracking-[0.3em] uppercase mb-4"
          >
            We're Here for You
          </motion.div>

          {/* Main Heading - Bebas Neue */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-4xl md:text-5xl lg:text-6xl text-[#FDCC00] tracking-wide leading-tight mb-6"
          >
            INTEGRATED SUPPORT & SERVICES
          </motion.h2>

          {/* Body Text - Segoe UI */}
           <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="bee-body mb-9 max-w-xl"
          >
            Get the help you need, anytime, anywhere. BeeSee ensures you stay
            connected and supported because we believe great technology
            deserves great care.
          </motion.p>

          {/* Feature Cards */}
          <div className="space-y-5">
            {features.map((item, i) => {
              const IconComponent = item.icon;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
                  className="group relative flex items-start gap-4 bg-gradient-to-br from-white/10 to-white/5 
                           backdrop-blur-md border border-[#FDCC00]/20 p-5 rounded-xl
                           hover:border-[#FDCC00]/50 hover:shadow-xl hover:shadow-[#FDCC00]/20
                           hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Gradient glow on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 bg-gradient-to-br 
                                from-[#FDCC00]/5 via-transparent to-[#FFD700]/5 pointer-events-none">
                  </div>

                  {/* Icon Container */}
                  <div className="relative p-3 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/10 
                                rounded-full border border-[#FDCC00]/30 
                                group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <IconComponent className="w-6 h-6 text-[#FDCC00]" />
                    
                    {/* Pulsing glow */}
                    <div className="absolute inset-0 rounded-full bg-[#FDCC00]/20 blur-lg 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* Title - Georgia */}
                    <h3 
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      className="text-lg md:text-xl text-white mb-1
                               group-hover:text-[#FDCC00] transition-colors duration-300 tracking-wide"
                    >
                      {item.title}
                    </h3>
                    
                    {/* Description - Segoe UI */}
                    <p 
                      style={{ fontFamily: "Segoe UI, sans-serif" }}
                      className="text-sm md:text-base text-[#C7B897]/80 leading-relaxed
                               group-hover:text-[#C7B897]/100 transition-colors duration-300"
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative group">
            {/* Glow effect behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FDCC00]/20 to-[#FFD700]/20 
                          rounded-2xl blur-2xl opacity-50 group-hover:opacity-70 
                          transition-opacity duration-500 scale-105">
            </div>

            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#FDCC00]/30 
                          shadow-2xl shadow-[#FDCC00]/20 group-hover:border-[#FDCC00]/50 
                          transition-all duration-500 group-hover:scale-[1.02]">
              <img
                src={image}
                alt="Customer Support"
                className="w-full h-auto object-cover"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent 
                            pointer-events-none">
              </div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 
                          border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 
                          rounded-tl-2xl transition-all duration-500"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 
                          border-[#FDCC00]/0 group-hover:border-[#FDCC00]/70 
                          rounded-br-2xl transition-all duration-500"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SupportServices;