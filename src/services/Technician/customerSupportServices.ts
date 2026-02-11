import axiosClient from "../../axiosClient";

const TICKETS_API_URL = "/tickets";

export const createCustomerSupport = async (ticketData: any) => {
  try {
    const response = await axiosClient.post(`${TICKETS_API_URL}`, ticketData, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const fetchSchools = async () => {
   try {
    const response = await axiosClient.get(`/schools`);
    return response.data;
  } catch (error) {
    throw error
  }
}
 
export const images = async ({ id, image }: { id: string | number, image: FormData }) => {
  try {
    const response = await axiosClient.post(`${TICKETS_API_URL}/${id}/image`, image, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const fetchCategory = async () => {
  try {
    const response = await axiosClient.get(`/categories/cs/public`);
    return response.data;
  } catch (error) {
    throw error
  }
}

export const fetchDevices = async( id: number ) => {
  try {
    const response = await axiosClient.get(`/products/${id}/public`);
    return response.data
  } catch(error) {
    throw error
  }
}

export const fetchIssue = async ( id: number ) => {
  try {
    const response = await axiosClient.get(`/issues/${id}/public`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const fetchDevice = async () => {
  try {
    const response = await axiosClient.get(`/products/public`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
