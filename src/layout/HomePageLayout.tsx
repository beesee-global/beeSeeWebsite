import { useLocation } from "react-router-dom";
import FooterHomePage from "../components/ui/FooterHomePage";
import FooterHomePageProducts from "../components/ui/FooterHomePageProducts";
import HeaderHomePage from "../components/ui/HeaderHomePage";
import { Outlet } from "react-router-dom"; 
import { useEffect, useRef, useState } from "react";

const HomePageLayout = () => {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const hideLayoutRoutes = []; 
  const hideHeaderRoutes = ["/sign-up/2046", "/sign-in", "/forget-password", "/tech/sign-in"];

  const shouldHideLayout = hideLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );
  
  // Detect product detail page using regex
  const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);
  
  // Check if header should be hidden
  const hideHeader = hideHeaderRoutes.some((path) =>
    location.pathname.startsWith(path)
  ) || isProductDetailPage;

  // Scroll logic for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) setShowHeader(true);
      else if (currentScrollY > lastScrollY.current) setShowHeader(false);
      else setShowHeader(true);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      {!hideHeader && (
        <div
          className={`fixed top-0 left-0 w-full z-[9999] bg-white shadow transition-transform duration-500 ${
            showHeader ? "translate-y-0" : "translate-y-0"
          }`}
        >
          <HeaderHomePage />
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${!hideHeader ? "pt-[80px]" : ""}`}>
        <Outlet />
      </div>

      {/* Footer - Show on product detail pages but not on auth pages */}
      {!shouldHideLayout && (
        <>
          {isProductDetailPage ? <FooterHomePageProducts /> : !hideHeader && <FooterHomePage />}
        </>
      )}
    </div>
  );
};

export default HomePageLayout;