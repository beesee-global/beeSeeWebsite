import axiosClient from "../../axiosClient";

const API_URL = `/applicants`
type ApplicantId = string | number | number[];
 

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

export const fetchApplicantsHired = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/hired`, {
      params: {
        status: 'HIRED',
        job_applicant: id
      }
    });

    return response.data
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

export const fetchApplicantsNewApplicants = async (id: string) => {
  try {
    const response = await axiosClient.get(`${API_URL}/new-applicant`, {
      params: {
        status: 'NEW_APPLICANT',
        job_applicant: id
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}
 
export const shortList = async (payload: { id: number[]; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/shortlisted  `, {
      user_id: payload.user_id,
      ids: payload.id
    });
    return response.data
  } catch (error) {
    throw error
  }
}

export const rejectedApplicants = async (payload: { id: number[]; user_id?: string | number; remarks?: string }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/rejected`, {
      user_id: payload.user_id,
      ids:  payload.id,
      remarks: payload.remarks,
    })
    return response.data
  } catch (error) {
    throw error
  }
};

export const closedApplicants = async (payload: { id: number[]; user_id?: string | number }) => {
  try {
    const response = await axiosClient.put(`${API_URL}/closed`, {
      user_id: payload.user_id,
      ids:  payload.id 
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

export const interviewAction = async (type: string, pid: string) => {
  try {
    const response = await axiosClient.get(
      `${API_URL}/interview/action`,
      {
        params: {
          type,
          pid
        }
      }
    );

    return response;
  } catch (error) {
    throw error;
  }
};

export const interviewList = async () => {
  try { 
    const response = await axiosClient.get(
      `${API_URL}/interview-list`
    );

    return response
  } catch (error) {
    throw error
  }
}

export const applicantUpdateStatus = async (data: any) => {
  try {
    const response = await axiosClient.put(
      `${API_URL}/update-status`, data
    );

    return response
  } catch (error) {
    throw error
  }
}

export const applicantAttendanceStatus = async(data: any) => {
  try {
    const response = await axiosClient.put(
      `${API_URL}/update-attendance`, data
    );

    return response
  } catch (error) {
    throw error
  }
}
