import axiosClient from "../../axiosClient";

export const getJobPostings = async (job_ref: string) => {
  try {
    const response = await axiosClient.get(`/careers/${job_ref}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching job postings:', error);
    throw error;
  }
}

export const careersEmail  = async(data: any) => {
  try {
    const response = await axiosClient.post(`careers/sent-email`, data, {
      headers: {
        "Content-Type": 'multipart/form-data'
      }
    });

    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllJobPosting = async () => {
  try {
    const response = await axiosClient.get(`/careers`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const deleteCareers = async (ids: number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`/careers`, {
      data: { ids }  // send payload in `data` for DELETE
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getSpecificJob = async (id: string) => {
  try {
    const response = await axiosClient.get(`/careers/${id}`);
    return response.data.data;
  } catch (error) {
    throw error
  }
}
 
export const updateJob = async (payload: {id: number | string, jobData: any}) => {
    try {
        const { id, jobData } = payload;
        const response = await axiosClient.put(`/careers/${id}`, jobData, {
            headers: {
                "Content-Type": "application/json",
            }
        });
        return response.data;
    } catch (error) {
       throw error
    }
} 

// post inserting product
export const createJob = async (data: any) => {
    try {
        const response = await axiosClient.post(`/careers`, data, {
            headers: {
                "Content-Type": "application/json",
            }
        })
        return response;
    } catch (error) {
        throw error
    }
} 

