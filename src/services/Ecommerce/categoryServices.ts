import axiosClient from "../../axiosClient";
import { normalizeApiResponse } from "../../utils/apiCollections";

const API_URL = "/ecom_category";

// post insert category 
export const createCategory = async (data:any) => {
    try {
        const response = await axiosClient.post (`${API_URL}`, data, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
}

// delete category
export const deleteCategory = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
}

// get all category
export const fetchAllCategory = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        // The API wraps the category list as { data: [...] }. Return the list
        // itself so every category consumer receives the same shape.
        return Array.isArray(response.data?.data) ? response.data.data : response.data;
    } catch (error) {
        throw error
    }
}

// get all category
export const fetchAllCategoryPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/public`);
        return Array.isArray(response.data?.data) ? response.data.data : response.data;
    } catch (error) {
        throw error
    }
}


// get Specific category
export const fetchEmployeeByPid = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        // Return the category body, matching the shape expected by
        // CategoryForm. The backend response contains the numeric `id` that
        // must be used for the subsequent PUT request.
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
}

// put update category 
export const updateCategory = async (payload: { id: number | string, categoryData: any }) => {
    try {
        const { id, categoryData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, categoryData, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return normalizeApiResponse(response);
    } catch (error) {
        throw error;
    }
} 

export const fetchCategoriesPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/public`);
        return Array.isArray(response.data?.data) ? response.data.data : response.data
    } catch (error) {
        throw error
    }
}
