import { useNavigate } from "react-router-dom"

export const userToken = (token: string) => {
    localStorage.setItem('beesee-user', JSON.stringify(token));
};

export const getToken = () => {
    const stored = localStorage.getItem('beesee-user');
    if (!stored) return '';
    const token = JSON.parse(stored);
    return token && token.token ? `Bearer ${token.token}` : '';
}

export const authenticateUser = () => {
    const stored = localStorage.getItem('beesee-user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user?.id;
}

