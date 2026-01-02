import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Briefcase, MapPin } from "lucide-react";

const SectionThree: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* ======================================================
     STRONG LINEAR PARALLAX (NO BOUNCE)
  ====================================================== */
  const titleY = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const contentY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [90, -90]);

  const items = [
    {
      title: "We are Field Experts",
      desc:
        "Our expertise spans ICT, STEM, Robotics, TechVoc, Wellness, Accounting, and Business Management—supported by years of hands-on industry experience.",
      icon: <GraduationCap size={28} />,
    },
    {
      title: "WE CREATE DIGITAL CONTENT",
      desc:
        "We develop polished, impactful digital content that blends creativity, technical accuracy, and user-centered design.",
      icon: <Briefcase size={28} />,
    },
    {
      title: "WE DEVELOP PEOPLE & TEAMS",
      desc:
        "We empower organizations through structured training, skills development, and capability-building programs.",
      icon: <MapPin size={28} />,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative scroll-section pt-32 md:pt-40 lg:pt-48 pb-36 md:pb-44 lg:pb-56 px-6 md:px-10 lg:px-12 overflow-hidden"
      style={{
        backgroundImage: "url('/live-background/randomBg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
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
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* TITLE */}
        <motion.div
          style={{ y: titleY }}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <h3 className="bee-title-md text-[var(--beesee-gold)] gold-glow">
            BEESEE GLOBAL TECHNOLOGIES INC.
          </h3>
          <p className="bee-body max-w-3xl mx-auto mt-6">
            BeeSee Global Technologies is a trusted provider of digital
            solutions, training programs, and industry-aligned content built
            for long-term growth.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-14">
          {items.map((item, index) => (
            <motion.div
              key={index}
              style={{ y: cardsY }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: "easeOut",
                },
              }}
              viewport={{ once: false, amount: 0.25 }}
              className="beesee-card-content card-glow"
              whileHover={{ y: -12 }}
            >
              <div className="icon-wrap">{item.icon}</div>
              <h4 className="beesee-card-content-title">{item.title}</h4>
              <p className="bee-body">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SectionThree;
