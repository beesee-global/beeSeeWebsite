import axiosClient from "../../axiosClient";

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

export const loggedInUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`/auth/login`, data);
    return response.data;
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

export const deleteUsers = async (ids: number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: { ids }
    });

    return response.data
  } catch (error) {
    throw error
  }
}