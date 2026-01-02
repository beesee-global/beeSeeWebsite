import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const VideoPlayer = () => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // ref for scroll tracking
    const videoRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: videoRef,
        offset: ['start end', 'center start'],
        // start end when top elements hits bottom of viewport
        // center start when center reaches top
    });

    const width = useTransform(scrollYProgress, [0, 1], ['100%', '95%']);
    const borderRadius = useTransform(scrollYProgress, [0, 1], ['0rem', '2rem']);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

    return (
        <div>
            {/* Video Player */}
            <motion.div
                ref={videoRef}
                style={{
                    width,
                    borderRadius,
                    scale,
                }}
                className="relative w-full h-[85vh] max-w-8xl p-10 lg:p-0 mb-10 mt-10 mx-auto rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Thumbnail (only show when not playing) */}
                {!isPlaying && <img src="/your-thumbnail.jpg" alt="Video thumbnail" className="w-full h-full object-cover" />}

                {/* Overlay button */}
                {!isPlaying && (
                    <div className="flex flex-col">
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white z-10 cursor-pointer transition hover:bg-black/60">
                            <span className="text-4xl font-bold mb-4">Welcome to Beese Global Technologies Inc</span>
                            <p className="text-lg opacity-80" onClick={() => setIsPlaying(true)}>
                                Click to play
                            </p>
                        </div>
                    </div>
                )}

                {/* Video (show only when playing) */}
                {isPlaying && (
                    <video className="w-full h-full object-cover" controls autoPlay>
                        <source src="/your-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </motion.div>
        </div>
    );
};

export default VideoPlayer;
