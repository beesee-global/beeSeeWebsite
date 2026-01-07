import axiosClient from "../../axiosClient";

const API_URL = "/categories";

// post insert category 
export const createCategory = async (data:any) => {
    try {
        const response = await axiosClient.post (`${API_URL}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
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
        return response;
    } catch (error) {
        throw error
    }
}

// get all category
export const fetchAllCategory = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// get Specific category
export const fetchEmployeeByPid = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// put update category 
export const updateCategory = async (payload: { id: number | string, categoryData: FormData }) => {
    try {
        const { id, categoryData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, categoryData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
} 

export const fetchCategoriesPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/home`);
        return response.data
    } catch (error) {
        throw error
    }
} 