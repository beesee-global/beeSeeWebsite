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

export const deleteCategories = async (ids: number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: { ids }  // send payload in `data` for DELETE
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
