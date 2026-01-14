import axiosClient from "../../axiosClient";

const API_URL = `/applicants`

export const fetchApplicants = async () => {
  try {
    const response = await axiosClient.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const fetchApplicantsShortList= async () => {
  try {
    const response = await axiosClient.get(`${API_URL}/short-list?status=SHORTLISTED`);
    return response.data
  } catch (error) {
    throw error
  }
}

export const shortList = async (id: number) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${id}`);
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteApplicants = async (ids: number[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: { ids }  // send payload in `data` for DELETE
    });
    return response.data
  } catch (error) {
    throw error
  }
}