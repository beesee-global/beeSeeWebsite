// HeroProducts.tsx
import React from "react";
import { motion } from "framer-motion";

/* SHIMMER KEYFRAMES */
const goldShimmerStyle = `
@keyframes goldShimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: -200% 50%; }
}
`;

const HeroProducts = () => {
  return (
    <>
      {/* Inject shimmer keyframes */}
      <style>{goldShimmerStyle}</style>

      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* VIDEO BACKGROUND */}
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

          {/* DARK OVERLAY (FIXED) */}
          <div className="absolute inset-0 bg-[#000000] opacity-[0.85]" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center text-white">
          <div className="flex flex-col gap-2">

            {/* SUBTEXT */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="font-georgia text-[#FDCC00]/80 text-sm md:text-base tracking-[0.3em] uppercase"
            >
              BEESEE PRODUCTS
            </motion.p>

            {/* SHIMMER TITLE */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="
                font-bebas text-5xl md:text-7xl lg:text-8xl leading-tight
                bg-gradient-to-r from-[#6b5200] via-[#fbd463] to-[#6b5200]
                bg-[length:200%_auto] text-transparent bg-clip-text
                animate-[goldShimmer_3s_linear_infinite]
              "
              style={{ WebkitTextFillColor: "transparent" }}
            >
              EXPLORE OUR TECHNOLOGY
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="font-segoe text-[#C7B897] text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mt-1"
            >
              Designed for creators, leaders, and professionals, our technology empowers you to{" "}
              <span className="text-[#FDCC00] font-georgia">envision</span>,{" "}
              <span className="text-[#FDCC00] font-georgia">connect</span>,{" "}
              <span className="text-[#FDCC00] font-georgia">inspire</span>{" "}
              with seamless performance built for real-world demands.
            </motion.p>

          </div>
        </div>
      </section>
    </>
  );
};

export default HeroProducts;
