import { NavLink, useLocation } from "react-router-dom";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import {
  Home,
  Box,
  Lightbulb,
  ChevronDown, 
  Tag, 
  User2,
  BookHeart,
  Users,
  Settings2
} from "lucide-react";
import GroupsIcon from '@mui/icons-material/Groups';
import { userAuth } from "../../hooks/userAuth";
import React, { 
  useEffect, 
  useState, 
  type ReactNode,
  useCallback
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
  const { userInfo } = userAuth();
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
      { name: "Dashboard", path: "/beesee/ecommerce/dashboard", icon: <Home size={20} /> },
      { name: "Category", path: "/beesee/ecommerce/category", icon: <Tag size={20} /> },
      { name: "Product", path: "/beesee/ecommerce/product", icon: <Box size={20} /> },
      {
        name: "Users",
        icon: <Users size={20} />,
        children: [
          { name: "List User", path: "/beesee/ecommerce/team-members", icon: <User2 size={17} /> },
          { name: "Position", path: "/beesee/ecommerce/position", icon: <Settings2 size={17} /> },
        ],
      },
    ]);
  };

  useEffect(() => {
    validating();
  }, []);

  const permissionDataLoaded = Array.isArray(userInfo?.permissions);
  const hasModulePermission = (parentId: string, childId = "") => {
    if (!permissionDataLoaded) return true;
    return Boolean(userInfo?.permissions?.some((permission) =>
      permission.parent_id === parentId && (permission.children_id || "") === childId
    ));
  };

  const visibleMenuItems = menuItems
    .map((item) => {
      if (!item.children) return hasModulePermission(
        item.name.toLowerCase() === "team members" ? "users" : item.name.toLowerCase()
      ) ? item : null;

      const children = item.children.filter((child) => {
        const childId = child.name.toLowerCase() === "list user" ? "list_user" : "position";
        return hasModulePermission("users", childId);
      });
      return children.length ? { ...item, children } : null;
    })
    .filter(Boolean) as MenuItem[];

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

  const handleMenuItemClick = useCallback(() => {
    // Close sidebar immediately on mobile when clicking any menu item
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar?.(false);
    }
  }, [setShowSidebar]);

  const handleMenuToggle = useCallback((name: string) => {
    // Toggle menu without closing sidebar
    toggleMenu(name);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] border-r border-white/10 overflow-y-auto">
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Navigation</h2>
      </div>

      {/* Menu Items */}
      <ul className="space-y-1 px-3 pb-6">
        {visibleMenuItems.map((item) => {
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
                    onClick={() => handleMenuToggle(item.name)}
                    className={`flex items-center justify-between gap-3 px-3 py-3 w-full rounded-md transition-all duration-200 ${
                      openMenus[item.name]
                        ? "bg-[#FCD000]/15 text-[#FCD000]"
                        : "text-white/75 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-yellow-400">{item.icon}</span>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 text-yellow-400 flex-shrink-0 ${
                        openMenus[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openMenus[item.name] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const childActive = location.pathname.startsWith(child.path);
                        return (
                          <li key={child.name}>
                            <NavLink
                              to={child.path}
                              style={{ color: childActive ? "#111827" : undefined }}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all duration-200 active:scale-95 ${
                                childActive
                                  ? "bg-[#FCD000] text-black shadow-sm"
                                  : "text-white/70 hover:bg-white/8 hover:text-white"
                              }`}
                              onClick={handleMenuItemClick}
                            >
                              <span
                                className={`${
                                  childActive ? "text-black" : "text-yellow-400"
                                } flex-shrink-0`}
                              >
                                {child.icon}
                              </span>
                              <span className="font-semibold" style={{ color: childActive ? "#111827" : undefined }}>{child.name}</span>
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
                  style={{ color: isActive ? "#111827" : undefined }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-[#FCD000] text-black shadow-sm"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                  }`}
                  onClick={handleMenuItemClick}
                >
                  <span className={`${isActive ? "text-black" : "text-[#FCD000]"} flex-shrink-0`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold" style={{ color: isActive ? "#111827" : undefined }}>{item.name}</span>
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
