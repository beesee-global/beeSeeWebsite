// src/pages/About/components/VideoPlayer.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-[92%] max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
        <iframe
          src={videoUrl}
          title="Company Story Video"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-4 bg-white/15 hover:bg-white/30 text-[var(--text-light)] text-sm font-segoe font-semibold px-3 py-1.5 rounded-full transition"
        >
          ✕ Close
        </button>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
