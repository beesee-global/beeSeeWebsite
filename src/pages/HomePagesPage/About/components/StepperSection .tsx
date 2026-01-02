/* ======================================================================
   STEPPER — ULTIMATE UPGRADE
   Premium UI • Soft Motion • DaisyUI + Framer Motion
   NO CONTENT ALTERED — EXPERIENCE ONLY IMPROVED
====================================================================== */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

import ictPictue from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey10.jpg";
import digitalContent from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey9.jpg";
import revolunizing from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey8.jpg";
import program from "../../../../../public/assets/images/elleAssets/HoneyCombPictures/honey1.jpg";

const steps = [
  { id:1, title:"Differentiated activities through ICT", short:"ICT-driven activities tailored to different learning styles and needs.", 
    description:"Interactive tools and digital platforms help teachers reach visual, auditory, and kinesthetic learners in one ecosystem.",
    image: ictPictue },

  { id:2, title:"Digital Content", short:"Curriculum-aligned media and modules, ready to deploy.",
    description:"High-quality digital lessons, assessments, and simulations that fit existing programs while opening space for new approaches.",
    image: digitalContent },

  { id:3, title:"Revolutionizing Curriculum", short:"Aligning subjects with emerging skills and industries.",
    description:"We help schools integrate 21st-century competencies, STEM, and industry tools into their curriculum without losing structure.",
    image: revolunizing },

  { id:4, title:"Professional Development Program", short:"Equipping teachers and leaders with future-ready skills.",
    description:"Structured training, coaching, and certification ensure that people behind the systems can sustain innovation long-term.",
    image: program },
];

export default function StepperSection() {

  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <section className="bg-[#000000] py-10">
      <div className="max-w-7xl mx-auto pb-10 pt-10 lg:px-10">

        {/* TITLE */}
        <motion.h2 
          initial={{ opacity:0, y:20 }} 
          whileInView={{ opacity:1, y:0 }} 
          viewport={{ once:true }}
          transition={{ duration:.7 }}
          className="bee-title-md text-center text-[var(--beesee-gold)]"
        >
          SCHOOL PROCESS
        </motion.h2>

        <motion.p 
          initial={{ opacity:0 }} 
          animate={{ opacity:1 }} 
          transition={{ delay:.4 }}
          className="bee-body text-[#C7B897]/80 max-w-3xl mx-auto text-center mt-4"
        >
          A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
        </motion.p>


        <div className="grid lg:grid-cols-2 gap-14 mt-16 items-center">

          {/* LEFT — Step Selector Enhanced */}
          <div className="space-y-6">

            {steps.map((step,i)=>{

              const activeStep = i === active;

              return(
                <motion.div 
                  key={i}
                  whileHover={{ scale:1.03, x:8 }}
                  transition={{ type:"spring", stiffness:200 }}
                  className="cursor-pointer flex gap-4 items-start group"
                  onClick={()=> setActive(i)}
                >

                  {/* Circle */}
                  <motion.div
                    animate={activeStep ? { scale:1.25, boxShadow:"0 0 20px #FDCC00aa" }:{ scale:1 }}
                    className={`h-8 w-8 rounded-full flex items-center justify-center border 
                    transition 
                    ${activeStep?"bg-[#FDCC00] text-black border-[#FDCC00]":"border-[#9d9d9d] text-[#9d9d9d] group-hover:border-[#FDCC00] group-hover:text-[#FDCC00]"}`}
                  >
                    {step.id}
                  </motion.div>

                  {/* Titles */}
                  <div>
                    <p className={`bee-body font-semibold transition 
                      ${activeStep?"text-[#FDCC00]":"text-white group-hover:text-[#FDCC00]"}`}>
                      {step.title}
                    </p>
                    <p className="bee-body text-xs text-[#C7B897]/70">{step.short}</p>
                  </div>

                </motion.div>
              )
            })}

          </div>


          {/* RIGHT — New Animated Card */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.id}
              initial={{ opacity:0, scale:.96, y:10 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:.94, y:-10 }}
              transition={{ duration:.5 }}
              className="rounded-2xl overflow-hidden border border-[#FDCC00]/30
              shadow-[0_0_40px_rgba(253,204,0,0.08)] bg-black/40 backdrop-blur-xl"
            >

              {/* IMAGE with cinematic motion */}
              <motion.div className="relative overflow-hidden group">
                <motion.img 
                  src={current.image} 
                  className="w-full h-64 object-cover transition duration-700 group-hover:scale-[1.08]" 
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* Step Count Tag */}
                <div className="absolute bottom-3 left-5 text-[#FDCC00] text-sm font-semibold">
                  Step {current.id} / {steps.length}
                </div>
              </motion.div>

              {/* CONTENT */}
              <div className="p-7">
                <h3 className="bee-title-sm text-[#FDCC00]">{current.title}</h3>
                <p className="bee-body text-[#C7B897]/90 mt-2">{current.description}</p>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
