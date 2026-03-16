import axiosClient from "../../axiosClient";

const API_URL = '/categories'

export const createCategories = async(categoriesData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, categoriesData, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data
    } catch (error) {
        throw error
    }
}
 
export const fetchCategories = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCategoriesSortedByName = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/select-field`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCategoriesNoIsActive = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/no_is_active`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const deleteCategories = async (payload: FormData | number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: payload instanceof FormData ? payload : { ids: payload },
      headers: payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}  

export const updateCategories = async (id: number, payload: any) => {
    try {
         const response = await axiosClient.put(`${API_URL}/${id}`, payload);
         return response.data
    } catch(error) {
        throw error;
    }
}
