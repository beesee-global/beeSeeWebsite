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
    PanelLeftOpen
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
            <div className="mb-4 flex justify-end">
                <button
                    onClick={toggleCollapse}
                    className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black transition-colors"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            <ul className="space-y-2">
                {menuItems.map(item => {
                    const isActive = item.path && (location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
                    const hasActiveChild = item.children?.some(child => location.pathname.startsWith(child.path));

                    const borderTopClass = item.isUnderLineTop ? 'border-t-2 mb-2 border-yellow-400' : '';

                    return (
                        <li key={item.id} className={borderTopClass}>
                            {item.children ? (
                                <div className="relative group">
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-3 py-3 w-full rounded-md transition-colors ${hasActiveChild ? "bg-yellow-500 text-black" : openMenus[item.id] ? "bg-gray-900 text-yellow-500" : "hover:bg-gray-900 text-gray-300"}`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                                            <span className={hasActiveChild ? 'text-black' : 'text-yellow-500'}>{item.icon}</span>
                                            {!isCollapsed && <span className="font-semibold">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && <ChevronDown size={18} className={`transition-transform ${openMenus[item.id] ? "rotate-180 text-yellow-500" : hasActiveChild ? "text-black" : "text-gray-400"}`} />}
                                    </button>

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 top-0 bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                                            {item.name}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {!isCollapsed && (
                                        <div className={`overflow-hidden transition-all duration-300 ${openMenus[item.id] ? "max-h-96" : "max-h-0"}`}>
                                            <ul className="ml-6 mt-1 space-y-1">
                                                {item.children.map(child => {
                                                    const childActive = location.pathname.startsWith(child.path);
                                                    return (
                                                        <li key={child.id}>
                                                            <NavLink
                                                                to={child.path}
                                                                className={`flex items-center gap-2 px-3 py-3 rounded-md text-md transition-colors ${childActive ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-900"}`}
                                                                onClick={() => window.innerWidth < 768 && setShowSidebar?.(false)}
                                                            >
                                                                <span className={`${childActive ? "text-black" : "text-yellow-500"}`}>{child.icon}</span>
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
                                <NavLink
                                    to={item.path || "#"}
                                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-md transition-opacity ${isActive ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-900"}`}
                                    onClick={() => window.innerWidth < 768 && setShowSidebar?.(false)}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <span className={`${isActive ? "text-black" : "text-yellow-500"}`}>{item.icon}</span>
                                    {!isCollapsed && <span className="font-semibold">{item.name}</span>}
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
