import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/NavigationWebsiteConfiguration";
import Sidebar from "../components/ui/SidebarWebsiteConfiguration";
import { userAuth } from "../hooks/userAuth";
import SnackbarTechnician from "../components/feedback/SnackbarTechnician";

const WebsiteConfigurationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, userInfo, userNav, setUserNav, activeArea, activateSession, snackBarOpen, snackBarMessage, snackBarType, setSnackBarOpen } = userAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    activateSession('websiteConfiguration');
  }, [activateSession]);

  useEffect(() => {
    if (token !== undefined) setChecked(true);
  }, [token]);

  useEffect(() => {
    if (!checked || activeArea !== 'websiteConfiguration') return;
    if (!token) {
      navigate("/beesee/website-configuration/login", { replace: true });
      return;
    }

    const hasAdminAccess = ["website_configuration", "website_configuration_url"].includes(userInfo?.url_permission || "")
      || userInfo?.url?.startsWith("/beesee/website-configuration");
    if (!hasAdminAccess) {
      // This area has its own credentials. Sending an Ecommerce or Technician
      // session to the generic technician sign-in page immediately redirects
      // it back to that area's dashboard instead of showing this login form.
      navigate("/beesee/website-configuration/login", { replace: true });
    }
  }, [checked, activeArea, token, userInfo, navigate]);

  useEffect(() => {
    setShowSidebar(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showSidebar) return;
    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-website-menu-button]") && !target.closest("[data-website-sidebar]")) setShowSidebar(false);
    };
    document.addEventListener("click", closeOnOutside, true);
    return () => document.removeEventListener("click", closeOnOutside, true);
  }, [showSidebar]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserNav(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [setUserNav]);

  if (!checked) return <div className="flex items-center justify-center h-screen text-gray-500" />;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {showSidebar && <div className="fixed inset-0 z-40 md:hidden bg-black/50" aria-hidden="true" onClick={() => setShowSidebar(false)} />}
      <aside className="hidden md:block border-r border-gray-800 overflow-y-auto" style={{ backgroundColor: "#000000" }}>
        <Sidebar />
      </aside>
      <div data-website-sidebar className={`fixed inset-y-0 left-0 z-50 w-[280px] md:hidden transform transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar setShowSidebar={setShowSidebar} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        <div data-website-menu-button><Navigation setShowSidebar={setShowSidebar} /></div>
        <main className="flex-1 overflow-y-auto relative z-0"><Outlet /></main>
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

export default WebsiteConfigurationLayout;
