import React, { createContext, useState, useEffect, useCallback } from 'react'
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
    positions_id?: number | string | null;
    status?: string;
    url: string;
    url_permission: string;
    image?: File | string | null;
    permissions?: Permission[]
}

export type AuthArea = 'technician' | 'ecommerce' | 'websiteConfiguration';

interface AuthSession {
    token: string;
    userInfo: User;
}

const sessionStorageKey: Record<AuthArea, string> = {
    technician: 'beesee.auth.technician',
    ecommerce: 'beesee.auth.ecommerce',
    websiteConfiguration: 'beesee.auth.websiteConfiguration',
};

const getAreaForUser = (user: User): AuthArea => {
    if (user.url_permission === 'ecommerce' || user.url_permission === 'ecommerce_url') return 'ecommerce';
    if (user.url_permission === 'website_configuration' || user.url_permission === 'website_configuration_url') return 'websiteConfiguration';
    return 'technician';
};

const isSessionCompatible = (area: AuthArea, session: AuthSession): boolean => {
    const user = session.userInfo;
    if (getAreaForUser(user) !== area) return false;

    const destination = user.url || '';
    // A previous ticketing login was accidentally stored as Ecommerce when
    // ticketing-system.users_details.url_permission contained "ecommerce".
    // Do not restore that stale session into the Ecommerce panel.
    if (area === 'ecommerce') {
        return !destination.startsWith('/beesee/dashboard')
            && !destination.startsWith('/beesee/technician');
    }

    if (area === 'websiteConfiguration') {
        return !destination.startsWith('/beesee/dashboard')
            && !destination.startsWith('/beesee/technician')
            && !destination.startsWith('/beesee/ecommerce');
    }

    return !destination.startsWith('/beesee/ecommerce')
        && !destination.startsWith('/beesee/website-configuration');
};

const readSession = (area: AuthArea): AuthSession | null => {
    try {
        const stored = localStorage.getItem(sessionStorageKey[area]);
        if (stored) {
            const session = JSON.parse(stored) as AuthSession;
            if (isSessionCompatible(area, session)) return session;
            localStorage.removeItem(sessionStorageKey[area]);
        }

        // Preserve a user's current session during the one-time upgrade from
        // the former shared `token` and `user` storage keys.
        const token = localStorage.getItem('token');
        const userValue = localStorage.getItem('user');
        if (!token || !userValue) return null;
        const userInfo = JSON.parse(userValue) as User;
        if (!isSessionCompatible(area, { token, userInfo })) return null;

        const session = { token, userInfo };
        localStorage.setItem(sessionStorageKey[area], JSON.stringify(session));
        return session;
    } catch {
        return null;
    }
};

const getAreaForPath = (): AuthArea | null => {
    const path = window.location.pathname;
    if (path.startsWith('/ecom/') || path.startsWith('/beesee/ecommerce')) return 'ecommerce';
    if (path.startsWith('/website_configuration/') || path.startsWith('/website-configuration/') || path.startsWith('/beesee/website-configuration')) return 'websiteConfiguration';
    if (path.startsWith('/technician/') || path.startsWith('/beesee/')) return 'technician';
    return null;
};

interface AuthContextType {
    userInfo: User | null;
    token: string | null;
    login: (data: { 
        token: string; 
        userInfo: User; 
    }, area?: AuthArea) => void
    logout: () => void;
    activeArea: AuthArea | null;
    activateSession: (area: AuthArea) => void;
    updateUserSession: (updates: Partial<User>) => void;
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
    const [activeArea, setActiveArea] = useState<AuthArea | null>(() => getAreaForPath());
    const [userInfo, setUserInfo] = useState<User | null> (() => {
        const area = getAreaForPath();
        const session = area ? readSession(area) : null;
        if (session) return session.userInfo;
        const storeUser = localStorage.getItem("user");
        return storeUser ? JSON.parse(storeUser) : null
    });

    const [token, setToken] = useState<string | null>(() => {
        const area = getAreaForPath();
        return area ? readSession(area)?.token ?? null : localStorage.getItem("token");
    });
    const [snackBarType, setSnackBarType] = useState<AlertColor>('success')
    const [snackBarMessage, setSnackBarMessage] = useState<string>("")
    const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("Pending");

    const logoutMutation = useMutation({
        mutationFn: logoutUser
    });

    const activateSession = useCallback((area: AuthArea) => {
        const session = readSession(area);
        setActiveArea(area);
        setUserInfo(session?.userInfo ?? null);
        setToken(session?.token ?? null);

        // Existing Axios and Socket.IO consumers read these legacy keys. Keep
        // them pointed at the session for the area currently being viewed.
        if (session) {
            localStorage.setItem("token", session.token);
            localStorage.setItem("user", JSON.stringify(session.userInfo));
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }, [])

    const updateUserSession = useCallback((updates: Partial<User>) => {
        setUserInfo((currentUser) => {
            if (!currentUser) return currentUser;

            const updatedUser = { ...currentUser, ...updates };
            const area = activeArea || getAreaForUser(updatedUser);
            const storedSession = localStorage.getItem(sessionStorageKey[area]);

            if (storedSession) {
                try {
                    const session = JSON.parse(storedSession) as AuthSession;
                    localStorage.setItem(
                        sessionStorageKey[area],
                        JSON.stringify({ ...session, userInfo: updatedUser })
                    );
                } catch {
                    // The in-memory session is still updated even if a stale
                    // storage value cannot be parsed.
                }
            }

            // Keep legacy consumers in sync with the currently active panel.
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, [activeArea]);

    const login = (data: { token: string; userInfo: User }, requestedArea?: AuthArea) => {
        // Each administrator login page supplies its own panel explicitly.
        // This prevents an old database url_permission value from storing a
        // valid login in the wrong panel's session key.
        const area = requestedArea ?? getAreaForUser(data.userInfo);
        const session = { ...data, userInfo: { ...data.userInfo } };
        localStorage.setItem(sessionStorageKey[area], JSON.stringify(session));
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.userInfo));
        setActiveArea(area);
        setUserInfo(data.userInfo);
        setToken(data.token)
    }

    const logout = () => {
        const area = activeArea || (userInfo ? getAreaForUser(userInfo) : null);
        if (area) localStorage.removeItem(sessionStorageKey[area]);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        const userId = userInfo?.id;
        if (area === 'technician' && userId) {
            logoutMutation.mutate(userId);
        }
        setActiveArea(null);
        setToken(null);
        setUserInfo(null);
    }

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // The legacy `token`/`user` keys are shared by all admin panels.
            // Ignore their cross-tab updates; otherwise logging into one
            // panel changes the active user in every other panel tab.
            const currentArea = getAreaForPath();
            if (!currentArea) return;
            const areaKey = sessionStorageKey[currentArea];
            if (event.key !== areaKey) return;

            try {
                const session = event.newValue ? JSON.parse(event.newValue) as AuthSession : null;
                if (session && isSessionCompatible(currentArea, session)) {
                    setUserInfo(session.userInfo);
                    setToken(session.token);
                } else {
                    setUserInfo(null);
                    setToken(null);
                }
            } catch {
                setUserInfo(null);
                setToken(null);
            }
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
            activeArea,
            activateSession,
            updateUserSession,
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
