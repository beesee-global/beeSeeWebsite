// src/pages/About/components/PhilippineHeritage.tsx
import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, MapPin } from "lucide-react";

const PhilippineHeritage: React.FC = () => {
  const culturalImpacts = [
    {
      title: "We are Field Experts",
      description:
        "Deep experience across ICT, STEM, robotics, TechVoc, wellness, accounting, and business management.",
      icon: <GraduationCap size={26} />,
    },
    {
      title: "We are Digital Content Developers",
      description:
        "We design and produce digital content that is technically sound, classroom-ready, and aligned with industry skills.",
      icon: <Briefcase size={26} />,
    },
    {
      title: "We Build Capacity & Teachers",
      description:
        "Teacher training, certification, and hands-on workshops help technology become part of everyday teaching.",
      icon: <MapPin size={26} />,
    },
  ];

  return (
    <section className="about-section about-section--last bg-gradient-to-b from-[var(--bg-black)] to-[var(--bg-black)] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="about-section-gradient about-section-gradient--bottom" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-14 text-center"
        >
          <h3 className="font-bebas gold-glow text-3xl sm:text-4xl lg:text-5xl text-[var(--text-light)] mb-3">
            BeeSee Global,{" "}
            <span className="bg-gradient-to-r from-[var(--beesee-gold-soft)] to-[var(--beesee-gold)] bg-clip-text text-transparent">
              proudly Filipino.
            </span>
          </h3>
          <p className="font-segoe text-sm sm:text-base md:text-lg text-[var(--muted)] max-w-3xl mx-auto">
            Our roots are Philippine classrooms and communities. That context
            shapes every device, platform, and program we ship.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {culturalImpacts.map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -6 }}
              className="about-glass-card rounded-2xl p-7 border border-white/10 bg-black/85 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--beesee-gold)]/15 border border-[var(--beesee-gold)]/70 text-[var(--beesee-gold)]">
                {impact.icon}
              </div>
              <h4 className="font-bebas text-lg sm:text-xl text-[var(--text-light)] mb-3">
                {impact.title}
              </h4>
              <p className="font-segoe text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                {impact.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhilippineHeritage;
