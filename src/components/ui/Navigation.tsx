import React, { useContext, useMemo, useEffect, useRef } from "react";
import { LogOut, User, Menu } from "lucide-react";
import beeseeGoldLogo from '../../../public/beeseeGoldLogo.png';
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "../../services/myAccountServices";
import { userAuth } from '../../hooks/userAuth';

interface NavigationProps { 
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserData {
  first_name: string;
  last_name: string;
  image?: File | string | null;
}

const Navigation: React.FC<NavigationProps> = ({ setShowSidebar }) => {
  const { userInfo, logout, userNav, setUserNav } = userAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const id = userInfo?.id;

  const { data: userInformation } = useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUserById(String(id)),
    enabled: !!id
  });

  const user: UserData = useMemo(() => ({
    first_name: userInformation?.first_name || "Loading...",
    last_name: userInformation?.last_name || "",
    image: userInformation?.image || null,
  }), [userInformation]);

  const preview = useMemo(() => {
    if (user.image instanceof File) {
      return URL.createObjectURL(user.image);
    } else if (typeof user.image === "string" && user.image.trim() !== "") {
      return user.image;
    }
    return undefined;
  }, [user.image]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserNav(false);
      }
    };

    if (userNav) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [userNav, setUserNav]);

  return (
    <div className="flex items-center justify-between py-2 px-3 md:px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full border-b border-gray-300">
      <div className="flex gap-2 items-center"> 
        {/* Mobile Menu Button */}
        <div 
          onClick={() => setShowSidebar(true)}
          className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 cursor-pointer"
        >
          <Menu className="text-white"/>
        </div>

        {/* Logo */}
        <img 
          src={beeseeGoldLogo} 
          alt="BeeSee Logo" 
          className="w-[150px] h-auto hover:cursor-pointer" 
        />
      </div>

      {/* Profile Dropdown */}
      <div className="relative flex flex-col" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ Prevent outside click from firing immediately
            setUserNav(prev => !prev);
          }}
          className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition"
        >
          {user.image ? (
            <img
              src={preview}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-8 h-8 rounded-full bg-white object-cover"
            />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold">
              {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
            </div>
          )}
          <span className="font-semibold max-w-[120px] text-sm md:text-md truncate">
            {user.first_name} {user.last_name}
          </span>
        </button>

        {userNav && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-white/20 text-gray-800 z-20">
            {/* My Account */}
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 transition"
              onClick={() => {
                navigate("/beesee/my-account");
                setUserNav(false);
              }}
            >
              <User size={18} className="text-gray-700" />
              <span>My Account</span>
            </button>

            <div className="border-t border-gray-200 my-1" />

            {/* Logout */}
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 transition text-red-600"
              onClick={() => {
                logout();
                navigate("/sign-in", { replace: true });
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}

            {/* Logout */}
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 transition text-red-600"
              onClick={() => {
                logout();
                navigate("/sign-in", { replace: true });
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
      </div>
    </div>
  );
};

export default Navigation;
