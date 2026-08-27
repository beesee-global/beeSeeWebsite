import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/NavigationEcommerce";
import Sidebar from "../components/ui/SidebarEcommerce";
import ModulePermissionGuard from "../components/auth/ModulePermissionGuard";
import { userAuth } from "../hooks/userAuth";

const MainLayout = () => {
  const navigate = useNavigate();
  const { token, userInfo, userNav, setUserNav } = userAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [checked, setChecked] = useState(false);

  // Mark as checked when token/userInfo ready
  useEffect(() => {
    if (token !== undefined) {
      setChecked(true);
    }
  }, [token]);

  // Handle redirects
  useEffect(() => {
    if (!checked) return;
    if (!token) {
      navigate("/ecom/sign-in", { replace: true });
    } else if (userInfo?.url_permission !== "ecommerce") {
      navigate("/ecom/sign-in", { replace: true });
    }
  }, [checked, token, userInfo, navigate]);

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

  useEffect(() => {
    const expandSidebarOnMobile = () => {
      if (window.innerWidth < 768) setIsSidebarCollapsed(false);
    };

    expandSidebarOnMobile();
    window.addEventListener("resize", expandSidebarOnMobile);
    return () => window.removeEventListener("resize", expandSidebarOnMobile);
  }, []);

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div
        className={`hidden shrink-0 overflow-y-auto transition-[width] duration-300 md:block ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((previous) => !previous)}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        data-sidebar
        className={`fixed inset-y-0 left-0 z-40 w-[min(16rem,calc(100vw-1rem))] max-w-full transform bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out md:hidden ${
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navigation setShowSidebar={setShowSidebar} />
        <main className="ecommerce-admin-content relative z-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <ModulePermissionGuard>
            <Outlet />
          </ModulePermissionGuard>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
