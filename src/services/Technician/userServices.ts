import axiosClient from "../../axiosClient";
import { UserProfileFormData, UserProfileFormErrors } from "../../models/user";

const API_URL = "/users"
export const image = async (id:number | string, data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/${id}/image`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    throw error
  }
}

export const userInformation = async(formData : UserProfileFormData) => {
  try {
    const response = await axiosClient.post(`users_userinfo`, formData, {
      headers: {
        "Content-Type" : "application/json"
      }
    })

    return response
  } catch (error) {
    throw error
  }
}

export const loggedInUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`/auth/login`, data);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const verifyPassword = async (data: any) => {
  try {
    const response = await axiosClient.post(`/auth/verify-password`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchUsers = async (id: any) => {
  try { 
    const response = await axiosClient.get(`${API_URL}?id=${id}`);
    return response.data
  } catch (error) {
    throw error;
  }
}

export const createUsers = async (payload: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const fetchUsersByPid = async (id: number | string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/by-pid/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const updateUsers = async (id: number | string, payload: any) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const fetchPositions = async () => {
    try {
        const response = await axiosClient.get('/positions');
        return response.data;
    } catch (error) {
        throw error;
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

export const forgetPassword = async (data: any) => {
  try {
    const response = await axiosClient.post(`/auth/forget-password`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}

export const changePassword = async (data: any) => {
  try {
    const response = await axiosClient.post(`/auth/change-password`, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}

export const logoutUser = async (id: number) => {
  try {
    const response = await axiosClient.post(`/auth/${id}/logout`);
    return response.data
  } catch (error) { 
    throw error
  }
}