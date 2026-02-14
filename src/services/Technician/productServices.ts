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

export const deleteProducts = async (ids: number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: { ids }  // send payload in `data` for DELETE
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