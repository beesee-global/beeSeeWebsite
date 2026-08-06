import React, { useEffect, useMemo, useRef } from "react";
import { LogOut, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import beeseeGoldLogo from "../../../public/beeseeGoldLogo.png";
import { userAuth } from "../../hooks/userAuth";

interface NavigationProps {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationWebsiteConfiguration: React.FC<NavigationProps> = ({ setShowSidebar }) => {
  const { userInfo, logout, userNav, setUserNav } = userAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useMemo(() => {
    const names = String(userInfo?.full_name || "").trim().split(/\s+/).filter(Boolean);
    return {
      first_name: names[0] || "User",
      last_name: names.slice(1).join(" "),
      role: userInfo?.role || "Website administrator",
    };
  }, [userInfo]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setUserNav(false);
    };
    if (userNav) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userNav, setUserNav]);

  return (
    <header className="flex min-h-16 items-center justify-between px-3 py-2 md:px-6 bg-[#080808] w-full border-b border-white/10 shadow-sm">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10"
          aria-label="Open website configuration navigation"
        >
          <Menu className="text-white" />
        </button>
        <img src={beeseeGoldLogo} alt="BeeSee Logo" className="w-[132px] sm:w-[150px] h-auto" />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setUserNav((current) => !current)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white"
          aria-label="User menu"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold">
            {`${user.first_name.charAt(0)}${user.last_name.charAt(0) || ""}`}
          </span>
          <span className="font-semibold max-w-[160px] text-sm truncate">{user.first_name} {user.last_name}</span>
        </button>

        {userNav && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <div className="px-3 py-2 text-xs text-gray-500 border-b">{user.role}</div>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                setUserNav(false);
                navigate("/beesee/website-configuration/account");
              }}
            >
              <User size={18} /> Account
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-gray-100"
              onClick={() => { logout(); navigate("/beesee/website-configuration/login", { replace: true }); }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationWebsiteConfiguration;
