import axiosClient from "../../axiosClient";

const API_URL = '/faqs'

export const createFaqs = async(faqsData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, faqsData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchFaqsAllPublic = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}/public`)
        return response.data
    } catch (error) {
        throw error
    }
} 

export const fetchFaqsAll = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}`)
        return response.data
    } catch (error) {
        throw error
    }
} 

export const fetchAllDevices = async() => {
    try {
        const response = await axiosClient.get(`/categories/no_is_active`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchAllDevicesPublic = async() => {
    try {
        const response = await axiosClient.get(`/categories/public`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchAllProducts = async () => {
    try {
        const response = await axiosClient.get(`/products`);
        return response.data
    } catch (error) {
        throw error
    }
}
export const deleteFaqs = async (payload: FormData | number[] | string[]) => {
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

export const updateFaqs = async(id: number, payload: any) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${id}`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}