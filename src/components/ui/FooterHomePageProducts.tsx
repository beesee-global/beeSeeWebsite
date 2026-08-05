import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { Link } from "react-router-dom";

const FooterHomePage = () => {
  return (
    <footer className="relative overflow-hidden">
      
      {/* ===========================
          STRAIGHT GOLDEN LINE DIVIDER
      ============================ */}
      <div className="w-full bg-[#000000]">
        <div className="h-1" style={{ 
          background: 'linear-gradient(90deg, #000000 0%, #FDCC00 50%, #000000 100%)',
          boxShadow: '0 0 15px rgba(253, 204, 0, 0.4)'
        }}></div>
      </div>

      {/* ===========================
          MAIN CONTENT AREA - BLACK BACKGROUND
      ============================ */}
      <div className="bg-[#000000] relative">
        
        {/* ===========================
                MAIN CONTENT
        ============================ */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
            
            {/* ========== LOGO & COMPANY INFO ========== */}
            <div className="space-y-4 md:space-y-5">
              <div>
                <img
                  src="/beeSeeGold.png"
                  alt="Beesee Logo"
                  className="w-36 sm:w-40 h-auto object-contain"
                />
              </div>

              <p className="text-[#C7B897] text-sm leading-relaxed">
                Empowering businesses with innovative technology solutions, advanced digital products, and premium customer support.
              </p>

              {/* Address */}
              <div className="flex items-start gap-3 pt-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-[#FDCC00] w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[#e8e8e8] text-sm font-medium">
                    #65-D Scout Borromeo,
                  </p>
                  <p className="text-[#C7B897] text-sm">
                    South Triangle, Quezon City
                  </p>
                </div>
              </div>
            </div>

            {/* ========== QUICK LINKS (HIDDEN ON MOBILE) ========== */}
            <div className="hidden sm:block">
              <h6 className="text-[#FDCC00] font-bold text-base mb-4 pb-2 border-b border-[#FDCC00]/30">
                Quick Links
              </h6>

              <div className="space-y-2.5">
                {[ 
                  { name: "Home", to: "/" },
                  { name: "About Us", to: "/about-beesee" },
                  { name: "Products", to: "/products" },
                  { name: "Solutions", to: "/solution" },
                  { name: "Customer Support", to: "/customer-support" },
                  { name: "FAQs", to: "/faqs" },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    className="block text-[#C7B897] hover:text-[#FDCC00] text-sm transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* ========== CONTACT INFORMATION ========== */}
            <div>
              <h6 className="text-[#FDCC00] font-bold text-base mb-4 pb-2 border-b border-[#FDCC00]/30">
                Contact Info
              </h6>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#FDCC00] flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="text-black w-3" />
                  </div>
                  <div>
                    <p className="text-[#C7B897]/70 text-xs uppercase tracking-wide">Phone</p>
                    <a href="tel:++639276093575" className="text-[#e8e8e8] text-sm font-medium hover:text-[#FDCC00] transition-colors">
                      +63 927 609 3575
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#FDCC00] flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="text-black w-3" />
                  </div>
                  <div>
                    <p className="text-[#C7B897]/70 text-xs uppercase tracking-wide">Email</p>
                    <a href="mailto:info@beese.ph" className="text-[#e8e8e8] text-sm font-medium hover:text-[#FDCC00] transition-colors">
                      info@beese.ph
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ========== SOCIAL MEDIA ========== */}
            <div>
              <h6 className="text-[#FDCC00] font-bold text-base mb-4 pb-2 border-b border-[#FDCC00]/30">
                Follow Us
              </h6>

              <p className="text-[#C7B897] text-sm mb-4">
                Stay updated with new technologies and innovations.
              </p>

              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/beesee.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-[#FDCC00]/30 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-200"
                >
                  <FacebookIcon className="text-[#FDCC00] hover:text-white w-4 h-4 transition-colors" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/beesee.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-[#FDCC00]/30 flex items-center justify-center hover:bg-gradient-to-r hover:from-[#E4405F] hover:to-[#FFD300] hover:border-transparent transition-all duration-200"
                >
                  <InstagramIcon className="text-[#FDCC00] hover:text-white w-4 h-4 transition-colors" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/beesee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg border border-[#FDCC00]/30 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all duration-200"
                >
                  <LinkedInIcon className="text-[#FDCC00] hover:text-white w-4 h-4 transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===========================
                COPYRIGHT SECTION - BLACK BACKGROUND
        ============================ */}
        <div className="border-t border-[#FDCC00]/20 pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              {/* Left side - Copyright text */}
              <div className="text-[#C7B897] text-sm">
                © {new Date().getFullYear()} Beesee Global (BSG) Technologies Inc. | All Rights Reserved.
              </div>

              {/* Right side - Policy links */}
              <div className="flex items-center gap-4 text-sm">
                <Link 
                  to="/privacy-policy" 
                  className="text-[#C7B897]/80 hover:text-[#FDCC00] transition-colors duration-200 text-xs"
                >
                  Privacy Policy
                </Link>
                <div className="w-px h-3 bg-[#FDCC00]/30"></div>
                <Link 
                  to="/terms-and-conditions" 
                  className="text-[#C7B897]/80 hover:text-[#FDCC00] transition-colors duration-200 text-xs"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterHomePage;
