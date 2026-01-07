import React, { useState } from "react";
import { ChevronRight, Check } from "lucide-react";

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
    description: "Interactive tools and digital platforms help teachers reach visual, auditory, and kinesthetic learners in one ecosystem.",
    image: ictPictue 
  },
  { 
    id: 2, 
    title: "Digital Content", 
    short: "Curriculum-aligned media and modules, ready to deploy.",
    description: "High-quality digital lessons, assessments, and simulations that fit existing programs while opening space for new approaches.",
    image: digitalContent 
  },
  { 
    id: 3, 
    title: "Revolutionizing Curriculum", 
    short: "Aligning subjects with emerging skills and industries.",
    description: "We help schools integrate 21st-century competencies, STEM, and industry tools into their curriculum without losing structure.",
    image: revolunizing 
  },
  { 
    id: 4, 
    title: "Professional Development Program", 
    short: "Equipping teachers and leaders with future-ready skills.",
    description: "Structured training, coaching, and certification ensure that people behind the systems can sustain innovation long-term.",
    image: program 
  },
];

const StepperSectionMobile: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = steps[activeStep];

  return (
    <section className="relative z-10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="bee-title-md text-[var(--beesee-gold)] text-base sm:text-lg mb-2">
            SCHOOL PROCESS
          </h2>
          <p className="bee-body text-[#C7B897]/90 text-[11px] sm:text-sm leading-relaxed px-4">
            A clear roadmap that guides schools from exploration to adoption—without overwhelming teachers or students.
          </p>
        </div>

        {/* Mobile-optimized vertical stepper */}
        <div className="space-y-6">
          {/* Step indicators - Horizontal scrollable for mobile */}
          <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              const isCompleted = i < activeStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className="flex-shrink-0 flex flex-col items-center"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${isActive ? "bg-[#FDCC00] border-[#FDCC00]" : 
                      isCompleted ? "bg-green-600 border-green-600" : 
                      "border-[#FDCC00]/40 bg-black/40"}
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`
                        text-sm font-bold
                        ${isActive ? "text-black" : "text-[#FDCC00]"}
                      `}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <span className={`
                    bee-body-sm mt-2 text-center max-w-[80px] truncate
                    ${isActive ? "text-[#FDCC00] font-semibold" : "text-[#C7B897]/70"}
                  `}>
                    {step.title.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current step content - Full width */}
          <div className="beesee-card-content border border-[#FDCC00]/20 rounded-xl overflow-hidden">
            {/* Step header with number */}
            <div className="p-4 border-b border-[#FDCC00]/10 bg-gradient-to-r from-[#FDCC00]/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDCC00] flex items-center justify-center">
                    <span className="text-black text-sm font-bold">{currentStep.id}</span>
                  </div>
                  <div>
                    <h3 className="bee-title-sm text-[#FDCC00]">
                      {currentStep.title}
                    </h3>
                    <p className="bee-body-sm text-[#C7B897]">
                      Step {currentStep.id} of {steps.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step image */}
            <div className="beesee-card-image relative h-48 overflow-hidden">
              <img 
                src={currentStep.image}
                alt={currentStep.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
            </div>

            {/* Step description */}
            <div className="p-5 space-y-4">
              <div>
               
                <p 
                  className="text-[#C7B897]/90 text-sm leading-relaxed italic"
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    fontStyle: 'italic'
                  }}
                >
            
                </p>
              </div>
              
              <div>
          
                <p className="bee-body text-[#C7B897]/90 text-sm leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between p-4 border-t border-[#FDCC00]/10">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                  ${activeStep === 0 
                    ? "opacity-50 cursor-not-allowed text-gray-500" 
                    : "text-[#FDCC00] hover:bg-[#FDCC00]/10 active:scale-95"}
                `}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="bee-body-sm">Previous</span>
              </button>
              
              <div className="flex items-center">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`
                      w-2 h-2 rounded-full mx-1
                      ${i === activeStep ? "bg-[#FDCC00]" : "bg-[#FDCC00]/30"}
                    `}
                  />
                ))}
              </div>
              
              <button
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStep === steps.length - 1}
                className={`
                  px-4 py-2 rounded-lg flex items-center space-x-2 transition-all
                  ${activeStep === steps.length - 1 
                    ? "opacity-50 cursor-not-allowed text-gray-500" 
                    : "text-[#FDCC00] hover:bg-[#FDCC00]/10 active:scale-95"}
                `}
              >
                <span className="bee-body-sm">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add this to your global CSS or Tailwind config for scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default StepperSectionMobile;