import { NavLink, useLocation } from "react-router-dom";
import React, { type ReactNode } from "react";
import { Home, Settings, Sparkles, Users, ChevronDown, User2, Settings2 } from "lucide-react";
import { userAuth } from "../../hooks/userAuth";

interface SidebarProps {
  setShowSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
}

const items: any[] = [
  { name: "Homepage", path: "/beesee/website-configuration/dashboard", icon: <Home size={20} /> },
  { name: "Featured Products", path: "/beesee/website-configuration/featured-product", icon: <Sparkles size={20} /> },
  { name: "Users", icon: <Users size={20} />, children: [
    { name: "List User", path: "/beesee/website-configuration/users", icon: <User2 size={17} /> },
    { name: "Position", path: "/beesee/website-configuration/position", icon: <Settings2 size={17} /> },
  ] },
];

const SidebarWebsiteConfiguration: React.FC<SidebarProps> = ({ setShowSidebar }) => {
  const location = useLocation();
  const { userInfo } = userAuth();
  const [openUsers, setOpenUsers] = React.useState(true);
  const permissionDataLoaded = Array.isArray(userInfo?.permissions);
  const hasPermission = (parentId: string, childId = "") => {
    if (!permissionDataLoaded) return true;
    return Boolean(userInfo?.permissions?.some((permission) =>
      permission.parent_id === parentId && (permission.children_id || "") === childId
    ));
  };
  const visibleItems = items
    .map((item) => {
      if (!item.children) {
        const permissionId = item.name === "Featured Products" ? "featured-product" : "dashboard";
        return hasPermission(permissionId) ? item : null;
      }
      const children = item.children.filter((child: any) =>
        hasPermission("users", child.name === "List User" ? "list_user" : "position")
      );
      return children.length ? { ...item, children } : null;
    })
    .filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-[#080808] border-r border-white/10 overflow-y-auto">
      <div className="px-5 pt-6 pb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Website Configuration</h2>
      </div>
      <ul className="space-y-1 px-3 pb-6">
        {visibleItems.map((item) => {
          const active = item.path && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`));
          const hasActiveChild = item.children?.some((child: any) => location.pathname.startsWith(child.path));
          return (
            <li key={item.path ?? item.name}>
              {item.children ? <>
                <button onClick={() => setOpenUsers((open) => !open)} className={`flex items-center justify-between gap-3 px-3 py-3 w-full rounded-md ${hasActiveChild ? "bg-[#FCD000] text-black" : openUsers ? "bg-[#FCD000]/15 text-[#FCD000]" : "text-white/75"}`}>
                  <span className="flex items-center gap-3"><span className={hasActiveChild ? "text-black" : "text-yellow-400"}>{item.icon}</span><span className="font-semibold">{item.name}</span></span>
                  <ChevronDown size={18} className={`${openUsers ? "rotate-180" : ""} ${hasActiveChild ? "text-black" : ""}`} />
                </button>
                {openUsers && <ul className="ml-6 mt-1 space-y-1">{item.children.map((child: any) => { const childActive = location.pathname.startsWith(child.path); return <li key={child.path}><NavLink to={child.path} onClick={() => setShowSidebar?.(false)} style={{ color: childActive ? "#111827" : undefined }} className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm ${childActive ? "bg-[#FCD000] text-black" : "text-white/70 hover:bg-white/8"}`}><span className={childActive ? "text-black" : "text-yellow-400"}>{child.icon}</span><span style={{ color: childActive ? "#111827" : undefined }}>{child.name}</span></NavLink></li> })}</ul>}
              </> : <NavLink
                to={item.path}
                onClick={() => setShowSidebar?.(false)}
                style={{ color: active ? "#111827" : undefined }}
                className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 active:scale-95 ${
                  active ? "bg-[#FCD000] text-black shadow-sm" : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className={active ? "text-black" : "text-yellow-400"}>{item.icon}</span>
                <span className="font-semibold" style={{ color: active ? "#111827" : undefined }}>{item.name}</span>
              </NavLink>}
            </li>
          );
        })}
      </ul>
      {/* <div className="mx-6 border-t border-white/10 pt-5 text-white/40">
        <Settings size={18} />
      </div> */}
    </div>
  );
};

export default SidebarWebsiteConfiguration;
