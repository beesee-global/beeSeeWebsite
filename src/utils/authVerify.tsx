import { useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthVerifyProps {
    children: ReactNode;
}

const AuthVerify = ({ children }: AuthVerifyProps) => {
    useEffect(() => {
        const storedToken = localStorage.getItem('beesee-user');
        if (storedToken) {
            try {
                const token = JSON.parse(storedToken);
                const decoded: any = jwtDecode(token.token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    // Token is expired
                    localStorage.removeItem('beesee-user');
                    // Admin panels now own their login routes. Do not force a
                    // generic legacy route that can redirect an active panel
                    // session away from its designated dashboard.
                }
            } catch (error) {
                console.error('Failed to decode token or JSON parse error:', error);
                localStorage.removeItem('beesee-user');
                // See the note above: route-specific layouts decide whether a
                // user must sign in again.
            }
        }
    }, []);

    return <>{children}</>;
};

export default AuthVerify;
