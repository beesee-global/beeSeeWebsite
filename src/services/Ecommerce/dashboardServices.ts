import axiosClient from "../../axiosClient";

const API_URL = "/dashboard"

export const fetchGraph = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/graph`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchDashboardUsers = async () => {
    const response = await axiosClient.get('/users', { params: { id: 0 } });
    return response.data?.data ?? [];
};
