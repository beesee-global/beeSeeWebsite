import React, { useMemo, useEffect, useRef } from "react";
import { LogOut, User, Menu } from "lucide-react";
import beeseeGoldLogo from "../../../public/beeseeGoldLogo.png";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "../../services/Ecommerce/myAccountServices";
import { userAuth } from "../../hooks/userAuth";

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
    queryKey: ["users", id],
    queryFn: () => fetchUserById(String(id)),
    enabled: !!id,
  });

  const user: UserData = useMemo(
    () => ({
      first_name: userInformation?.data?.first_name || "Loading...",
      last_name: userInformation?.data?.last_name || "",
      image: userInformation?.data?.image_url || null,
    }),
    [userInformation]
  );

  const preview = useMemo(() => {
    if (user.image instanceof File) {
      return URL.createObjectURL(user.image);
    }
    if (typeof user.image === "string" && user.image.trim() !== "") {
      return user.image;
    }
    return undefined;
  }, [user.image]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserNav(false);
      }
    };

    if (userNav) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [userNav, setUserNav]);

  // Cleanup object URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (preview && user.image instanceof File) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview, user.image]);

  return (
    <div className="ecommerce-navbar flex w-full items-center justify-between border-b border-gray-300 bg-[#000000] px-3 py-2 md:px-4">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 cursor-pointer transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="text-white" />
        </button>

        <img
          src={beeseeGoldLogo}
          alt="BeeSee Logo"
          className="ecommerce-navbar-logo h-auto w-[150px] cursor-pointer"
        />
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setUserNav((prev) => !prev);
          }}
          className="ecommerce-account-trigger flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-white transition-colors hover:bg-white/10"
          aria-label="User menu"
          aria-expanded={userNav}
        >
          {user.image ? (
            <img
              src={preview}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold">
              {user.first_name && user.last_name
                ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                : "U"}
            </div>
          )}

          <span className="font-semibold max-w-[120px] text-sm truncate">
            {user.first_name} {user.last_name}
          </span>
        </button>

        {userNav && (
          <div className="ecommerce-account-menu absolute right-0 top-full z-20 mt-2 w-40 rounded-lg border bg-white shadow-lg">
            <button
              className="ecommerce-account-menu-item flex w-full items-center gap-2 rounded-t-lg px-3 py-2 transition-colors hover:bg-gray-100"
              onClick={() => {
                navigate("/beesee/ecommerce/my-account");
                setUserNav(false);
              }}
            >
              <User size={18} />
              My Account
            </button>

            <div className="border-t my-1" />

            <button
              className="ecommerce-account-menu-item flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-red-600 transition-colors hover:bg-gray-100"
              onClick={() => {
                logout();
                navigate("/beesee/ecommerce/sign-in", { replace: true });
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
