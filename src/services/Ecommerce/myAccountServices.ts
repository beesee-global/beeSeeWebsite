import axiosClient from "../../axiosClient";

const API_URL = '/ecom_users'

/* Fetch account data */
export const  fetchUserById = async (id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        const payload = response.data;
        const user = payload?.data?.data ?? payload?.data ?? payload;
        return { data: user };
    }  catch (error) { 
        throw error; 
    }
};

/* Update account data */
export const updateAccountInfo = async (payload: { id: number | string, userData: FormData }) => {
    try {
        const { id, userData  } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}/my-account`, userData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: any) { 
        throw error;
    }
};
