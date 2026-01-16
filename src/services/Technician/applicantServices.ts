import axiosClient from "../../axiosClient";

const API_URL = `/applicants`

export const fetchApplicants = async (id: string) => {
  try {
    const response = await axiosClient.get(API_URL, {
      params: { job_applicant: id }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchApplicantsShortList = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/short-list`, {
      params: {
        status: 'SHORTLISTED',
        job_applicant: id
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
 
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