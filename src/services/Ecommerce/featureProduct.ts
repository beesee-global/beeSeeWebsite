import axiosClient from "../../axiosClient";

const API_URL = "/ecom_featured_product"

export const fetchSpecificDisplayPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/public`);
        return response
    } catch (error) {
        throw error
    }
}

export const createFeaturedProduct = async (formData: FormData) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const updateFeaturedProduct = async (id: number | string, formData: FormData) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const fetchAll = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response
    } catch (error) {
        throw error
    }
}

// fetch single featured product by id
export const fetchFeaturedById = async (id: string | number) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}

// delete category
export const deleteFeatured = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return response;
    } catch (error) {
        throw error
    }
}