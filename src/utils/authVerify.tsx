import { useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthVerifyProps {
    children: ReactNode;
}

const AuthVerify = ({ children }: AuthVerifyProps) => {
    useEffect(() => {
        const storedToken = localStorage.getItem('beesee-user');
        const currentPath = window.location.pathname;

        if (storedToken) {
            try {
                const token = JSON.parse(storedToken);
                const decoded: any = jwtDecode(token.token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    // Token is expired
                    localStorage.removeItem('beesee-user');
                    if (currentPath !== 'auth/login') {
                        window.location.href = 'auth/login';
                    }
                }
            } catch (error) {
                console.error('Failed to decode token or JSON parse error:', error);
                localStorage.removeItem('beesee-user');
                if (currentPath !== '/login') {
                    window.location.href = '/login';
                }
            }
        } else {
            window.location.href = 'auth/login';
        }
    }, []);

    return <>{children}</>;
};

export default AuthVerify;
