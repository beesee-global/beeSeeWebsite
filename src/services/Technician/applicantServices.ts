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

export const fetchApplicantsRejected = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/rejected`, {
      params: {
        status: 'REJECTED',
        job_applicant: id
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}
 
export const shortList = async (id: string) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${id}`);
    return response.data
  } catch (error) {
    throw error
  }
}

export const rejectedApplicants = async (id: string) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${id}/rejected`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const undoRejectedApplicants = async (id: string) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${id}/undo`)
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

export const getInformationApplicant = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/${id}/applicantInfo`);
    return response.data
  } catch (error) {
    throw error
  }
}

export const sendInterviewInvitation = async (data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/sending-interview`, data)
    return response.data
  } catch (error) {
    throw error
  }
}