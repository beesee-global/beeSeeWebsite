import { NavLink, useLocation } from "react-router-dom";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import {
  Home,
  Box,
  Lightbulb,
  ChevronDown, 
  Tag, 
  User2,
  BookHeart
} from "lucide-react";
import GroupsIcon from '@mui/icons-material/Groups';
import React, { 
  useEffect, 
  useState, 
  type ReactNode 
} from "react";

interface ChildItem {
  name: string;
  path: string;
  icon?: ReactNode;
}

interface MenuItem {
  name: string;
  path?: string;
  icon?: ReactNode;
  children?: ChildItem[];
}

interface SidebarProps {
  setShowSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ setShowSidebar }) => {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const validating = () => {
    setMenuItems([
      { name: "Dashboard", path: "/beesee/dashboard", icon: <Home size={20} /> },
      { name: "Category", path: "/beesee/category", icon: <Tag size={20} /> },
      { name: "Product", path: "/beesee/product", icon: <Box size={20} /> },
      { name: "Employee", path: "/beesee/employee", icon: <User2 size={20} /> },
      { name: "Consultation", path: "/beesee/consultation", icon: <GroupsIcon /> },
      {
        name: "Home display",
        icon: <Home size={20} />,
        children: [
          { name: "Our Journey", path: "/beesee/our-journey", icon: <BookHeart size={16} /> }, 
          { name: "Solutions Portfolio", path: "/beesee/solutions-overview", icon: <Lightbulb size={16} /> }, 
          { name: "Manage banner", path: "/beesee/manage-banner", icon: <ViewCarouselIcon sx={{ fontSize: 20 }}/> }, 
        ],
      }, 
    ]);
  };

  useEffect(() => {
    validating();
  }, []);

  // 🔥 Automatically expand dropdown if a child route is active
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname.startsWith(child.path)
        );
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname, menuItems]);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-yellow-400">Menu</h2>
      </div>

      {/* Menu Items */}
      <ul className="space-y-2">
        {menuItems.map((item) => {
          // 🟡 Mark as active if URL contains the item's base path
          const isActive =
            item.path &&
            (location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/"));

          return (
            <li key={item.name}>
              {item.children ? (
                // 🔽 Dropdown menu
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between gap-3 px-3 py-3 w-full rounded-md transition-colors ${
                      openMenus[item.name]
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "hover:bg-yellow-400/10 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400">{item.icon}</span>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform text-yellow-400 ${
                        openMenus[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openMenus[item.name] ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const childActive = location.pathname.startsWith(child.path);
                        return (
                          <li key={child.name}>
                            <NavLink
                              to={child.path}
                              className={`flex items-center gap-2 px-3 py-3 rounded-md text-md transition-colors ${
                                childActive
                                  ? "bg-yellow-600 text-white"
                                  : "text-white hover:bg-yellow-400/10"
                              }`}
                              onClick={() => {
                                if (window.innerWidth < 768) setShowSidebar?.(false);
                              }}
                            >
                              <span
                                className={`${
                                  childActive ? "text-white" : "text-yellow-400"
                                }`}
                              >
                                {child.icon}
                              </span>
                              <span className="font-semibold">{child.name}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                // Regular link
                <NavLink
                  to={item.path || "#"}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-yellow-600 text-white"
                      : "text-white hover:bg-yellow-400/10"
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) setShowSidebar?.(false);
                  }}
                >
                  <span className={`${isActive ? "text-white" : "text-yellow-400"}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
