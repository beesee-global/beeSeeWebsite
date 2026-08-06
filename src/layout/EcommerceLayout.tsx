import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/NavigationEcommerce";
import Sidebar from "../components/ui/SidebarEcommerce";
import { userAuth } from "../hooks/userAuth";
import SnackbarTechnician from "../components/feedback/SnackbarTechnician";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userInfo, userNav, setUserNav, activeArea, activateSession, snackBarOpen, snackBarMessage, snackBarType, setSnackBarOpen } = userAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [checked, setChecked] = useState(false);
  const isLoginRoute = location.pathname === "/beesee/ecommerce/login";

  useEffect(() => {
    if (isLoginRoute) return;
    activateSession('ecommerce');
  }, [activateSession, isLoginRoute]);

  // Mark as checked when token/userInfo ready
  useEffect(() => {
    if (token !== undefined) {
      setChecked(true);
    }
  }, [token]);

  // Handle redirects
  useEffect(() => {
    if (isLoginRoute || !checked || activeArea !== 'ecommerce') return;
    if (!token) {
      navigate("/beesee/ecommerce/login", { replace: true });
      return;
    }
    const hasEcommerceAccess =
      userInfo?.url_permission === "ecommerce" ||
      userInfo?.url_permission === "ecommerce_url" ||
      userInfo?.url?.startsWith("/beesee/ecommerce");

    if (!hasEcommerceAccess) {
      navigate("/beesee/ecommerce/login", { replace: true });
    }
  }, [isLoginRoute, checked, activeArea, token, userInfo, navigate]);

  // Close sidebar when route changes
  useEffect(() => {
    setShowSidebar(false);
  }, [navigate]);

  // Handle outside clicks for sidebar
  useEffect(() => {
    if (!showSidebar) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't close if clicking menu button
      if (target.closest('[data-menu-button]')) {
        return;
      }
      
      // Close if clicking outside sidebar
      const sidebar = document.querySelector('[data-sidebar]');
      if (sidebar && !sidebar.contains(target)) {
        setShowSidebar(false);
      }
    };

    // Use capture phase for more reliable detection
    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, [showSidebar]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSidebar(false);
        setUserNav(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setUserNav]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showSidebar]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
      
      </div>
    );
  }

  if (isLoginRoute) return <Outlet />;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <div className="hidden md:block w-64 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div
        data-sidebar
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out md:hidden ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar setShowSidebar={setShowSidebar} />
      </div>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        ></div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navigation setShowSidebar={setShowSidebar} />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
      <SnackbarTechnician
        open={snackBarOpen}
        type={snackBarType}
        message={snackBarMessage}
        onClose={() => setSnackBarOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
