import { NavLink, useLocation } from 'react-router-dom';
import React, { useState, useEffect, type ReactNode } from 'react';
import {  
    ChevronDown,   
    Package,
    BadgeAlert,
    User2,
    LayoutDashboard,
    MessageCircleQuestionMark,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    FileUser
} from "lucide-react";
import CategoryIcon from '@mui/icons-material/Category';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import WorkIcon from '@mui/icons-material/Work';
import { userAuth } from '../../hooks/userAuth'; 

interface ChildItem {
    name: string;
    path: string; 
    icon: ReactNode;
}

interface MenuItem {
    id: string;
    name: string;
    path?: string;
    icon?: ReactNode;
    isUnderLineTop?: boolean;
    children?: ChildItem[];
}

interface SidebarProps {
    setShowSidebar?: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarTechnician: React.FC<SidebarProps> = ({ setShowSidebar }) => {
    const location = useLocation();
    const { userInfo, isCollapsed, setIsCollapsed } = userAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({}); 

    const sidebarLayout: MenuItem[] = [
        { id: "dashboard", name: "Dashboard", path: '/beesee/dashboard', icon: <LayoutDashboard size={20}/> },
        { id: "job-order", name: "Job Order", path: "/beesee/job-order", icon: <WorkIcon size={20} /> }, 
        { id: "users", name: "Users", path: "/beesee/users", icon: <User2 size={20} /> },
        {
            id: "settings",
            name: 'Settings',
            icon: <Settings size={20}/>,
            children: [
                { id: "device", name: "Device type", path: "/beesee/device", icon: <CategoryIcon /> }, 
                { id: "model", name: "Model type", path: "/beesee/model", icon: <Package size={20} /> },
                { id: "issue", name: "Issue type", path: "/beesee/issue", icon: <BadgeAlert size={20} /> },
                { id: "position", name: "Position", path: "/beesee/position", icon: <ManageAccountsIcon /> },
            ],
        },
        { id: "faqs", name: "Faqs", path: "/beesee/faqs", isUnderLineTop: true, icon: <MessageCircleQuestionMark size={20} /> }, 
        { id: "inquiries", name: "Inquiries", path: "/beesee/inquiries", icon: <QuestionAnswerIcon /> },
        /* { id: "careers", name: "Careers", path: "/beesee/careers", icon: <FileUser /> }, */
    ];

    const toggleMenu = (id: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setTimeout(() => {
                setOpenMenus(prev => ({ ...prev, [id]: true }));
            }, 100);
        } else {
            setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        if (!isCollapsed) setOpenMenus({});
    };

    // Filter menu based on permissions
    useEffect(() => { 
        if (!userInfo) return;

        const filteredMenu = sidebarLayout
            .filter(item => {
                if (item.id === "dashboard") return true;
                if (!userInfo.permissions) return false;
                return userInfo.permissions.includes(item.id) || (item.children?.some(child => userInfo.permissions.includes(child.id)));
            })
            .map(item => {
                if (item.children) {
                    const filteredChildren = item.children.filter(child => userInfo.permissions.includes(child.id));
                    return { ...item, children: filteredChildren };
                }
                return item;
            });

        setMenuItems(filteredMenu);
    }, [userInfo]);

    // Automatically open menus if a child path is active
    useEffect(() => {
        if (!isCollapsed) {
            menuItems.forEach(item => {
                if (item.children) {
                    const hasActiveChild = item.children.some(child => location.pathname.startsWith(child.path));
                    if (hasActiveChild) {
                        setOpenMenus(prev => ({ ...prev, [item.id]: true }));
                    }
                }
            });
        }
    }, [location.pathname, menuItems, isCollapsed]);

    return (
        <div className={`p-4 min-h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-full min-w-64'}`} style={{ backgroundColor: '#000000' }}>
            {/* Toggle Button */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={toggleCollapse}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-yellow-500/50"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            <ul className="space-y-2">
                {menuItems.map(item => {
                    const isActive = item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
                    const hasActiveChild = item.children?.some(child => location.pathname.startsWith(child.path));

                    const borderTopClass = item.isUnderLineTop ? 'border-t pt-2 mt-4 border-yellow-500/30' : '';

                    return (
                        <li key={item.id} className={borderTopClass}>
                            {item.children ? (
                                <div className="relative group">
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        style={{
                                            background: hasActiveChild 
                                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                                                : openMenus[item.id]
                                                    ? 'rgba(31, 41, 55, 0.6)'
                                                    : 'transparent',
                                            color: hasActiveChild ? '#ffffff' : openMenus[item.id] ? '#ffffff' : ''
                                        }}
                                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3.5 w-full rounded-xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent ${
                                            hasActiveChild 
                                                ? "shadow-xl shadow-yellow-500/40 scale-[1.02]" 
                                                : openMenus[item.id] 
                                                    ? "border-yellow-500/20 hover:border-yellow-500/40" 
                                                    : "text-gray-400 hover:bg-gray-900/60 hover:text-white hover:border-yellow-500/20 hover:scale-[1.02] hover:translate-x-1"
                                        }`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'} transition-all duration-300`}>
                                            <span style={{ color: hasActiveChild ? '#ffffff' : openMenus[item.id] ? '#fbbf24' : '' }} className={`transition-all duration-300 ${!hasActiveChild && !openMenus[item.id] ? 'text-yellow-500 group-hover:text-yellow-400' : ''}`}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && <span className="font-semibold tracking-wide">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <ChevronDown 
                                                size={18}
                                                style={{ color: hasActiveChild ? '#ffffff' : openMenus[item.id] ? '#fbbf24' : '' }}
                                                className={`transition-all duration-300 ${
                                                    openMenus[item.id] 
                                                        ? "rotate-180" 
                                                        : !hasActiveChild 
                                                            ? "text-gray-500 group-hover:text-yellow-400"
                                                            : ""
                                                }`} 
                                            />
                                        )}
                                    </button>

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-3 top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2.5 rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-2xl border border-yellow-500/20">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-800"></div>
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {!isCollapsed && (
                                        <div className={`overflow-hidden transition-all duration-300 ${openMenus[item.id] ? "max-h-96 mt-2" : "max-h-0"}`}>
                                            <ul className="ml-4 space-y-1.5 pl-4 border-l-2 border-yellow-500/20">
                                                {item.children.map(child => {
                                                    const childActive = location.pathname.startsWith(child.path);
                                                    return (
                                                        <li key={child.id}>
                                                            <NavLink
                                                                to={child.path}
                                                                style={{
                                                                    background: childActive 
                                                                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                                                                        : 'transparent',
                                                                    color: childActive ? '#ffffff' : ''
                                                                }}
                                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-out border border-transparent ${
                                                                    childActive 
                                                                        ? "shadow-lg shadow-yellow-500/30 scale-[1.02]" 
                                                                        : "text-gray-400 hover:bg-gray-900/60 hover:text-white hover:border-yellow-500/20 hover:scale-[1.02] hover:translate-x-1"
                                                                }`}
                                                                onClick={() => window.innerWidth < 768 && setShowSidebar?.(false)}
                                                            >
                                                                <span style={{ color: childActive ? '#ffffff' : '' }} className={`transition-all duration-300 ${!childActive ? 'text-yellow-500 hover:text-yellow-400' : ''}`}>
                                                                    {child.icon}
                                                                </span>
                                                                <span className="font-semibold tracking-wide">{child.name}</span>
                                                            </NavLink>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    to={item.path || "#"}
                                    style={{
                                        background: isActive 
                                            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                                            : 'transparent',
                                        color: isActive ? '#ffffff' : ''
                                    }}
                                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3.5 rounded-xl transition-all duration-300 ease-out backdrop-blur-sm border border-transparent ${
                                        isActive 
                                            ? "shadow-xl shadow-yellow-500/40 scale-[1.02]" 
                                            : "text-gray-400 hover:bg-gray-900/60 hover:text-white hover:border-yellow-500/20 hover:scale-[1.02] hover:translate-x-1"
                                    }`}
                                    onClick={() => window.innerWidth < 768 && setShowSidebar?.(false)}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <span style={{ color: isActive ? '#ffffff' : '' }} className={`transition-all duration-300 ${!isActive ? 'text-yellow-500 hover:text-yellow-400' : ''}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && <span className="font-semibold tracking-wide">{item.name}</span>}
                                </NavLink>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SidebarTechnician;