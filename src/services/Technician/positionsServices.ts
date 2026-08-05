import axiosClient from "../../axiosClient";

const API_URL = '/positions'

export const createPositions = async(positionsData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, positionsData, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchPositions = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const deleteUsers = async (payload: FormData | number[] | string[]) => {
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

export const deletePositions = async (payload: FormData | number[] | string[]) => {
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

export const updatePositions = async (id: number, payload: any) => {
    try {
         const response = await axiosClient.put(`${API_URL}/${id}`, payload);
         return response.data
    } catch(error) {
        throw error;
    }
}
