import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "../components/ui/Navigation";
import Sidebar from "../components/ui/Sidebar";
import { userAuth } from "../hooks/userAuth";

const MainLayout = () => {
  const navigate = useNavigate();
  const { token, userInfo, userNav, setUserNav } = userAuth();
  const [showSidebar, setShowSidebar] = useState(false);
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
      navigate("/", { replace: true });
    } else if (userInfo?.role === "technician") {
      navigate("/tech/home", { replace: true });
    }
  }, [checked, token, userInfo, navigate]);

  // Handle outside clicks
  useEffect(() => {
    if (!userNav) return;
    const handleClickOutside = () => setUserNav(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userNav, setUserNav]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
      
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out md:hidden ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar setShowSidebar={setShowSidebar} />
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navigation setShowSidebar={setShowSidebar} />
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
