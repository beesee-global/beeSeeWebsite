import { useLocation } from "react-router-dom";
import FooterHomePage from "../components/ui/FooterHomePage";
import FooterHomePageProducts from "../components/ui/FooterHomePageProducts";
import HeaderHomePage from "../components/ui/HeaderHomePage";
import { Outlet } from "react-router-dom"; 
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { userAuth } from "../hooks/userAuth"; 
import Snackbar from "../components/feedback/Snackbar";

const HomePageLayout = () => {
  const {
    snackBarMessage,
    snackBarOpen,
    snackBarType,
    setSnackBarOpen
  } = userAuth(); 
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    // Reset immediately and once after the new route has painted. This avoids
    // mobile browser history restoration leaving a new page at the footer.
    resetScroll();
    lastScrollY.current = 0;

    const frame = window.requestAnimationFrame(resetScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search]);

  const hideLayoutRoutes: string[] = [];
  const hideHeaderRoutes = ["/sign-up/2046", "/ecom/sign-in", "/beesee/ecommerce/sign-in", "/forget-password", "/tech/sign-in", "/beesee/technician/sign-in", "/bsg/user-form", "/sign-in", "/applicants/action"];

  const shouldHideLayout = hideLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );
  
  // Detect product detail page: /product/:id
  const isProductDetailPage = /^\/product\/[^/]+$/.test(location.pathname);

  // Detect activity detail page: /activity/:id
  const isActivityDetailPage = /^\/activity\/[^/]+$/.test(location.pathname);

  const isProjectDetailPage = /^\/project\/[^/]+$/.test(location.pathname);
  
  // Keep the public header visible on product detail pages as well. Product
  // detail pages still use the shared public-site layout and footer.
  const hideHeader =
    hideHeaderRoutes.some((path) =>
      location.pathname.startsWith(path)
    ) ||
    isActivityDetailPage ||
    isProjectDetailPage;

  // Scroll logic for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Snackbar 
        message={snackBarMessage}
        open={snackBarOpen}
        type={snackBarType}
        onClose={() => setSnackBarOpen(false)}
      />
      
      {/* Header */}
      {!hideHeader && (
        <div
          className={`fixed top-0 left-0 w-full z-[9999] bg-white shadow transition-transform duration-500 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <HeaderHomePage />
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${!hideHeader ? "pt-[80px]" : ""}`}>
        <Outlet />
      </div>

      {/* Footer */}
      {!shouldHideLayout && (
        <>
          {isProductDetailPage ? (
            <FooterHomePageProducts />
          ) : (
            !hideHeader && <FooterHomePage />
          )}
        </>
      )}
    </div>
  );
};

export default HomePageLayout;
