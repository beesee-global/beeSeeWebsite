import { NavLink, useLocation } from "react-router-dom";
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import {
  Home,
  Box,
  ChevronDown, 
  Menu,
  Tag, 
  Users,
  Settings2,
} from "lucide-react";
import React, { 
  useEffect, 
  useState, 
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import { userAuth } from "../../hooks/userAuth";
import { hasModulePermission } from "../../utils/modulePermissions";

interface ChildItem {
  name: string;
  path: string;
  icon?: ReactNode;
  permissionParent: string;
  permissionChild?: string;
}

interface MenuItem {
  name: string;
  path?: string;
  icon?: ReactNode;
  children?: ChildItem[];
  permissionParent: string;
  permissionChild?: string;
}

interface SidebarProps {
  setShowSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  setShowSidebar,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { userInfo } = userAuth();

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const menuItems = useMemo<MenuItem[]>(() => {
    const allItems: MenuItem[] = [
      { name: "Dashboard", path: "/beesee/ecommerce/dashboard", icon: <Home size={20} />, permissionParent: "dashboard" },
      { name: "Category", path: "/beesee/ecommerce/category", icon: <Tag size={20} />, permissionParent: "category" },
      { name: "Product", path: "/beesee/ecommerce/product", icon: <Box size={20} />, permissionParent: "product" },
      { name: "Team Members", path: "/beesee/ecommerce/team-members", icon: <Users size={20} />, permissionParent: "users", permissionChild: "list_user" },
      { name: "Position", path: "/beesee/ecommerce/position", icon: <Settings2 size={20} />, permissionParent: "users", permissionChild: "position" },
      {
        name: "Home display",
        icon: <Home size={20} />,
        permissionParent: "featured-product",
        children: [
          { name: "Featured Products", path: "/beesee/ecommerce/feature-product", permissionParent: "featured-product" },
        ],
      },
    ];

    if (!userInfo) return allItems;

    return allItems
      .map((item) => {
        if (!item.children) return item;
        const children = item.children.filter((child) =>
          hasModulePermission(userInfo, child.permissionParent, child.permissionChild || ""),
        );
        return children.length ? { ...item, children } : null;
      })
      .filter((item): item is MenuItem => Boolean(item))
      .filter((item) => item.children || hasModulePermission(userInfo, item.permissionParent, item.permissionChild || ""));
  }, [userInfo]);

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
    if (isCollapsed) {
      onToggleCollapse?.();
      setOpenMenus((prev) => ({ ...prev, [name]: true }));
      return;
    }

    toggleMenu(name);
  }, [isCollapsed, onToggleCollapse]);

  return (
    <div
      className={`ecommerce-sidebar min-h-screen overflow-y-auto border-r border-gray-700 bg-[#000000] p-4 transition-[width] duration-300 ${
        isCollapsed ? "w-20" : "w-full min-w-64"
      }`}
    >
      <div className={`mb-5 flex items-center ${isCollapsed ? "justify-center" : "justify-end"}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 md:inline-flex"
          title={isCollapsed ? "Show sidebar labels" : "Hide sidebar labels"}
          aria-label={isCollapsed ? "Show sidebar labels" : "Hide sidebar labels"}
        >
          <Menu size={24} />
        </button>

        <button
          type="button"
          onClick={() => setShowSidebar?.(false)}
          className="ml-auto inline-flex rounded-lg p-2 text-yellow-400 transition-colors hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 md:hidden"
          aria-label="Close sidebar"
        >
          <Menu size={24} />
        </button>
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
                    onClick={() => handleMenuToggle(item.name)}
                    className={`flex w-full items-center px-3 py-3 transition-colors duration-200 ${
                      isCollapsed ? "justify-center rounded-lg" : "justify-between gap-3 rounded-md"
                    } ${
                      openMenus[item.name]
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "hover:bg-yellow-400/10 text-white"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? "" : "gap-3 flex-1"}`}>
                      <span className="text-yellow-400">{item.icon}</span>
                      {!isCollapsed && <span className="font-semibold">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        size={18}
                        className={`flex-shrink-0 text-yellow-400 transition-transform duration-300 ${
                          openMenus[item.name] ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!isCollapsed && (
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
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-all duration-200 active:scale-95 ${
                                childActive
                                  ? "bg-yellow-600 text-white"
                                  : "text-white hover:bg-yellow-400/10"
                              }`}
                              onClick={handleMenuItemClick}
                            >
                              <span
                                className={`${
                                  childActive ? "text-white" : "text-yellow-400"
                                } flex-shrink-0`}
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
                  )}
                </div>
              ) : (
                // Regular link
                <NavLink
                  to={item.path || "#"}
                  className={`flex min-w-0 items-center px-3 py-3 leading-5 transition-colors duration-200 active:scale-95 ${
                    isCollapsed ? "justify-center rounded-lg" : "gap-3 rounded-md"
                  } ${
                    isActive
                      ? "bg-yellow-600 text-white"
                      : "text-white hover:bg-yellow-400/10"
                  }`}
                  onClick={handleMenuItemClick}
                  title={isCollapsed ? item.name : undefined}
                  aria-label={isCollapsed ? item.name : undefined}
                >
                  <span className={`${isActive ? "text-white" : "text-yellow-400"} inline-flex h-5 w-5 shrink-0 items-center justify-center`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="min-w-0 whitespace-nowrap font-semibold">{item.name}</span>}
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
