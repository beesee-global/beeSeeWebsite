import React, { createContext, useState, useEffect } from 'react'

interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    permissions?: string[]
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

    const login = (data: { token: string; userInfo: User }) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userInfo));
        setUserInfo(data.userInfo);
        setToken(data.token)
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
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
            setUserNav 
        }}>
            { children }
        </AuthContext.Provider>
    )
}