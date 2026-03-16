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

export const fetchApplicantsClosed = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/closed`, {
      params: {
        status: 'CLOSED',
        job_applicant: id
      }
    });
    return response.data;
  } catch (error) {
    throw error
  }
}

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
 
export const shortList = async (payload: { id: string; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${payload.id}`, {
      user_id: payload.user_id,
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const rejectedApplicants = async (payload: { id: string; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${payload.id}/rejected`, {
      user_id: payload.user_id,
    })
    return response.data
  } catch (error) {
    throw error
  }
};

export const closedApplicants = async (payload: { id: string; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${payload.id}/closed`, {
      user_id: payload.user_id,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const undoRejectedApplicants = async (payload: { id: string; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/${payload.id}/undo`, {
      user_id: payload.user_id,
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteApplicants = async (payload: { ids: number[]; user_id?: string | number }) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: {
        ids: payload.ids,
        user_id: payload.user_id,
      }
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

export const jobDetails = async  (id: string) => {
  try {
    const response = await axiosClient.post(`${API_URL}/${id}/job-details`)
    return response.data
  } catch (error) {
    throw error
  }
}
