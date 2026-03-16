import axiosClient from "../../axiosClient";

const API_URL = `/inquiries`

export const createConsultation = async(data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data)
        return response.data;
    } catch (error) {
        throw error
    }
}

export const fetchCategory = async () => {
  try {
    const response = await axiosClient.get(`/categories`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const fetchInquiriesUnsettled = async () => {
  try {
    const response = await axiosClient.get(`${API_URL}?status=Unsettled`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const closeInquiries = async (data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/closed`, data, {
      headers: {
        "Content-Type": 'application/json'
      }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchInquiriesClosed = async () => {
  try {
    const response = await axiosClient.get(`${API_URL}?status=Closed`);
    return response.data;
  } catch (error) {
    throw error
  }
}


export const fetchInquiriesSettled = async () => {
  try {
    const response = await axiosClient.get(`${API_URL}?status=Settled`);
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchInquiriesByPid = async (pid: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/${pid}`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const fetchInquiriesById = async (id: number) => {
  try {
    const response = await axiosClient.get(`${API_URL}/${id}/inquiries`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteInquiries = async (payload: FormData | number[] | string[]) => {
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

export const inquiriesReply  = async(data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/reply`, data, {
      headers: {
        "Content-Type": 'multipart/form-data'
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}