    import axiosClient from "../../axiosClient";

const API_URL = `products`

export const fetchProducts = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCategories = async () => {
    try {
        const response = await axiosClient.get(`/categories`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const createProduct = async(categoriesData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, categoriesData, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const deleteProducts = async (payload: FormData | number[] | string[]) => {
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

export const updateProducts = async (id: number, payload: any) => {
    try {
         const response = await axiosClient.put(`${API_URL}/${id}`, payload);
         return response.data
    } catch(error) {
        throw error;
    }
}