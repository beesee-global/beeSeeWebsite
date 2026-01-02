/* =========================================================
   COMPANY STORY — PURE GOLD BRAND (NO GRADIENT)
   Visible Background Parallax + Subtle Foreground Lift
   NO TEXT MODIFIED — design only.
========================================================== */

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Heart, Sparkles, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OurJourneyPublic } from "../../../../services/ourJourneyServices";

const CompanyStory: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* ================= PARALLAX ================= */
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const { data: journeyResponse } = useQuery({
    queryKey: ["company"],
    queryFn: () => OurJourneyPublic(),
  });

  const storyMilestones: any[] = journeyResponse || [];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-20 pb-6 bg-[#000000]"
    >
      {/* 🔥 BACKGROUND — PARALLAX VIDEO */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 z-0"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/live-background/sectionThree.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#000000] opacity-50" />
      </motion.div>

      {/* ================= FOREGROUND ================= */}
      <motion.div
        style={{ y: fgY }}
        className="max-w-7xl mx-auto px-6 lg:px-10 relative z-[2]"
      >

        {/* ========= HEADER ========= */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-center mb-14"
        >
          <h2 className="bee-title-md text-[var(--beesee-gold)] leading-[1.1]">
            From Local Vision to Global Footprint
          </h2>

          <p className="bee-body max-w-2xl mx-auto text-[#C7B897]/90 mt-4">
            We started as a small team solving pain points in Philippine schools.
            Today, we build devices, content, and programs trusted by institutions
            nationwide—and ready for the world.
          </p>
        </motion.div>

        {/* ========= MISSION + VISION ========= */}
        <div className="grid md:grid-cols-2 gap-10 mb-10">
          <div className="beesee-card-content p-10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-[var(--beesee-gold)] w-6 h-6" />
              <h3 className="bee-title-sm text-[var(--beesee-gold)]">MISSION</h3>
            </div>
            <p className="bee-body text-[#C7B897]/90">
              To democratize advanced, human-centered technology for education and enterprise
              — making premium solutions accessible, sustainable, and rooted in real Philippine needs.
            </p>
          </div>

          <div className="beesee-card-content p-10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-[var(--beesee-gold)] w-6 h-6" />
              <h3 className="bee-title-sm text-[var(--beesee-gold)]">VISION</h3>
            </div>
            <p className="bee-body text-[#C7B897]/90">
              To establish Philippine-designed technologies as globally trusted — powering
              future-ready classrooms, campuses, and workplaces across Asia and beyond.
            </p>
          </div>
        </div>

        {/* ========= TIMELINE ========= */}
        <div className="relative space-y-20">
          {storyMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id || index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
              className="relative"
            >
              <div
                className="hidden lg:flex items-stretch gap-10"
                style={{ flexDirection: index % 2 === 0 ? "row" : "row-reverse" }}
              >
                <div className="w-1/2 relative rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
                  <img
                    src={milestone.image_url}
                    alt={milestone.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute bottom-4 left-5 px-6 py-2 rounded-full bg-[var(--beesee-gold)] text-black font-bebas text-xl">
                    {milestone.year}
                  </div>
                </div>

                <div className="w-1/2 flex items-center">
                  <div className="beesee-card-content p-10 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-[var(--beesee-gold)]" />
                      <h3 className="bee-title-sm text-[var(--beesee-gold)]">
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="bee-body text-[#C7B897]/90">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:hidden beesee-card-content overflow-hidden p-0">
                <img
                  src={milestone.image_url}
                  alt={milestone.title}
                  className="w-full h-60 object-cover"
                />
                <div className="p-6 space-y-3 text-left">
                  <h3 className="bee-title-sm text-[var(--beesee-gold)]">
                    {milestone.title}
                  </h3>
                  <p className="bee-body text-[#C7B897]/90">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ▽ Bottom Fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-[160px]
                   bg-gradient-to-b from-transparent to-[#000]"
      />
    </section>
  );
};

export default CompanyStory;
