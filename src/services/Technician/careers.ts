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