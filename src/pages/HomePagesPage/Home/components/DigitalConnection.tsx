import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../../../../assets/css/DigitalConnection.css";
import { ArrowRight } from "lucide-react";

/* ========== IMAGES ========== */
import Honey10 from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey10.jpg";
import Honey10BW from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey10Black.jpg";

import Honey9 from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey9.jpg";
import Honey9BW from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey9Black.jpg";

import Honey5 from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey5.jpg";
import Honey5BW from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey5Black.jpg";

import Honey2 from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey2.jpg";
import Honey2BW from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey2Black.jpg";

import Honey1 from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey1.jpg";
import Honey1BW from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey1Black.jpg";

/* SAME IMAGE ORDER */
const images = [
  { bw: Honey10BW, color: Honey10 },
  { bw: Honey5BW, color: Honey5 },
  { bw: Honey2BW, color: Honey2 },
  { bw: Honey1BW, color: Honey1 },
  { bw: Honey9BW, color: Honey9 },
];

const DigitalConnection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  /* SCROLL PARALLAX (SAME SYSTEM AS OTHER SECTIONS) */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const wrapperParallaxY = useTransform(scrollYProgress, [0, 1], [70, -100]);
  const carouselParallaxY = useTransform(scrollYProgress, [0, 1], [40, -60]);
  const textParallaxY = useTransform(scrollYProgress, [0, 1], [100, -140]);

  return (
    <section
      ref={sectionRef}
      className="scroll-section relative w-full bg-[#000] text-white overflow-hidden"
    >
      <motion.div
        style={{ y: wrapperParallaxY }}
        className="
          relative z-10
          max-w-[1400px] mx-auto
          px-6 md:px-10 lg:px-14
          pt-14 md:pt-18 lg:pt-20
          pb-16 md:pb-24 lg:pb-28
          grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20
          items-center
        "
      >
        {/* LEFT — CAROUSEL */}
        <motion.div
          style={{ y: carouselParallaxY }}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="carousel-container"
        >
          <div className="carousel-track">
            {images.concat(images).map((img, i) => (
              <div key={i} className="carousel-item-wrapper">
                <img
                  src={img.bw}
                  className="carousel-img bw-image"
                  loading="lazy"
                />
                <img
                  src={img.color}
                  className="carousel-img color-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — TEXT */}
        <motion.div
          style={{ y: textParallaxY }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col gap-6 md:gap-7"
        >
          <h2 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
            DIGITAL CONNECTION
          </h2>

          <p className="bee-body max-w-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Mauris non urna nec elit sollicitudin suscipit.
            Sed at tortor lectus. Fusce feugiat rhoncus felis.
          </p>

          <button
            onClick={() => navigate("/solution")}
            className="beesee-button beesee-button--small self-start flex items-center gap-3"
          >
            EXPLORE SERVICES
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DigitalConnection;
