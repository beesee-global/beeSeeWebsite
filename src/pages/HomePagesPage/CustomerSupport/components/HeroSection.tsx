import React from 'react';
import { FiZap } from "react-icons/fi";

const HeroSection = () => {
  return (
    <section className="  text-black py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_60%)]"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge with icon */}
          <div className="inline-flex items-center space-x-2 bg-gray-100  rounded-full px-4 py-2 mb-6">
            <FiZap className="text-black" size={18} />
            <span className="text-lg font-bold text-gray-600">Professional Support Hub</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Connect with Our
            <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Technical Specialists
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get expert consultation, technical support, and custom solutions from our team of specialists. We're here to help you make informed technology decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
