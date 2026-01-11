import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

// Mock images
const ictPictue = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80";
const digitalContent = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
const revolunizing = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80";
const program = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80";

const steps = [
  {
    id: 1,
    title: "Differentiated activities through ICT",
    short: "ICT-driven activities tailored to different learning styles and needs.",
    description:
      "Interactive tools and digital platforms help teachers reach visual, auditory, and kinesthetic learners in one ecosystem.",
    image: ictPictue,
  },
  {
    id: 2,
    title: "Digital Content",
    short: "Curriculum-aligned media and modules, ready to deploy.",
    description:
      "High-quality digital lessons, assessments, and simulations that fit existing programs while opening space for new approaches.",
    image: digitalContent,
  },
  {
    id: 3,
    title: "Revolutionizing Curriculum",
    short: "Aligning subjects with emerging skills and industries.",
    description:
      "We help schools integrate 21st-century competencies, STEM, and industry tools into their curriculum without losing structure.",
    image: revolunizing,
  },
  {
    id: 4,
    title: "Professional Development Program",
    short: "Equipping teachers and leaders with future-ready skills.",
    description:
      "Structured training, coaching, and certification ensure that people behind the systems can sustain innovation long-term.",
    image: program,
  },
];

const StepperSectionMobile: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = steps[activeStep];

  // 🔒 FORCE "THROUGH ICT" TO ALWAYS BE THE LAST LINE
  const renderTitle = (title: string) => {
    if (title.toLowerCase().includes("through ict")) {
      const main = title.replace(/through ict/i, "").trim();
      return (
        <>
          <span className="block">{main}</span>
          <span className="block">THROUGH ICT</span>
        </>
      );
    }
    return <span className="block">{title}</span>;
  };

  return (
    <section className="relative z-10 py-8 px-3">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 px-3">
          <h2 className="bee-title-md text-[var(--beesee-gold)] text-sm sm:text-lg mb-2">
            SCHOOL PROCESS
          </h2>
          <p className="bee-body text-[#C7B897]/90 text-[11px] sm:text-sm leading-relaxed max-w-md mx-auto">
            A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
          </p>
        </div>

        {/* Card */}
        <div className="beesee-card-content border border-[#FDCC00]/20 rounded-xl overflow-hidden">
          {/* Card Header */}
          <div className="p-4 border-b border-[#FDCC00]/10 bg-gradient-to-r from-[#FDCC00]/5 to-transparent">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#FDCC00] flex items-center justify-center shrink-0">
                <span className="text-black text-sm font-bold">{currentStep.id}</span>
              </div>
              <div className="min-w-0 w-full">
                <h3 className="bee-title-sm text-[#FDCC00] text-xs sm:text-base leading-tight text-center sm:text-left">
                  {renderTitle(currentStep.title)}
                </h3>
                <p className="bee-body-sm text-[#C7B897] text-[10px] sm:text-sm">
                  Step {currentStep.id} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="beesee-card-image relative h-44 overflow-hidden">
            <img
              src={currentStep.image}
              alt={currentStep.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <p
              className="text-[#C7B897]/90 italic text-[11px] sm:text-sm leading-relaxed text-center sm:text-left max-w-xs sm:max-w-none mx-auto"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {currentStep.short}
            </p>
            <p className="bee-body text-[#C7B897]/90 text-[11px] sm:text-sm leading-relaxed text-center sm:text-left max-w-sm sm:max-w-none mx-auto">
              {currentStep.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-4 border-t border-[#FDCC00]/10">
            <button
              onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
              disabled={activeStep === 0}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeStep === 0
                  ? "opacity-50 cursor-not-allowed text-gray-500"
                  : "text-[#FDCC00] hover:bg-[#FDCC00]/10 active:scale-95"
              }`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span className="bee-body-sm text-xs">Previous</span>
            </button>

            <div className="flex items-center">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    i === activeStep ? "bg-[#FDCC00]" : "bg-[#FDCC00]/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() =>
                setActiveStep((p) => Math.min(steps.length - 1, p + 1))
              }
              disabled={activeStep === steps.length - 1}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeStep === steps.length - 1
                  ? "opacity-50 cursor-not-allowed text-gray-500"
                  : "text-[#FDCC00] hover:bg-[#FDCC00]/10 active:scale-95"
              }`}
            >
              <span className="bee-body-sm text-xs">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepperSectionMobile;
