import React, { createContext, useState, useEffect } from 'react'
import { AlertColor } from '@mui/material/Alert';
import { logoutUser } from '../services/Technician/userServices'
import { useMutation } from '@tanstack/react-query';

interface Permission {
    parent_id: string;
    children_id: string;
    module_name: string;
    module_url: string;
    actions: string[];
}

interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    url: string;
    url_permission: string;
    image?: File | string | null;
    permissions?: Permission[]
}

interface AuthContextType {
    userInfo: User | null;
    token: string | null;
    login: (data: { 
        token: string; 
        userInfo: User; 
    }) => void
    logout: () => void;
    userNav: boolean;
    setUserNav: React.Dispatch<React.SetStateAction<boolean>>;

    // Snackbar
    snackBarOpen: boolean;
    setSnackBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    snackBarType: AlertColor;
    setSnackBarType: React.Dispatch<React.SetStateAction<AlertColor>>;
    snackBarMessage: string;
    setSnackBarMessage: React.Dispatch<React.SetStateAction<string>>;
    
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>
    statusFilter: string;

    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC <AuthProviderProps> = ({ children }) => {
    const [userNav, setUserNav] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<User | null> (() => {
        const storeUser = localStorage.getItem("user");
        return storeUser ? JSON.parse(storeUser) : null
    });

    const [token, setToken] = useState<string | null>(localStorage.getItem("token") || null);
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success')
    const [snackBarMessage, setSnackBarMessage] = useState<string>("")
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("Pending");

    const logoutMutation = useMutation({
        mutationFn: logoutUser
    });

    const login = (data: { token: string; userInfo: User }) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userInfo));
        setUserInfo(data.userInfo);
        setToken(data.token)
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        const userId = userInfo?.id;
        if (userId) {
            logoutMutation.mutate(userId);
        }
        setToken(null);
        setUserInfo(null);
    }

    useEffect(() => {
        const handleStorageChange = () => {
            const storeUser = localStorage.getItem("user")
            const storedToken = localStorage.getItem("token")
            setUserInfo(storeUser ? JSON.parse(storeUser) : null);
            setToken(storedToken);
        }

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [])

    return (
        <AuthContext.Provider value={{
            userInfo,
            token,
            login,
            logout,
            userNav, 
            setUserNav,
            snackBarOpen,
            setSnackBarOpen,
            snackBarType,
            setSnackBarType,
            snackBarMessage,
            setSnackBarMessage,
            isCollapsed,
            setIsCollapsed,
            statusFilter,
            setStatusFilter
        }}>
            { children }
        </AuthContext.Provider>
    )
}