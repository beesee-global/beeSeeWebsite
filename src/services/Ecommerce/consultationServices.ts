import axiosClient from "../../axiosClient";

const API_URL = "/inquiries"

export const fetchAllConsultation = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data
    } catch (error) {
        throw error;
    }
}

// post inserting consultations
export const createConsultation = async (data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data)
        return response;
    } catch (error) {
        throw error;
    }
}