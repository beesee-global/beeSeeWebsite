import axiosClient from "../../axiosClient";

const TICKETS_API_URL = "/tickets";

export const createCustomerSupport = async (ticketData: any) => {
  try {
    const response = await axiosClient.post(`${TICKETS_API_URL}/customer-support`, ticketData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export const fetchDevice = async () => {
  try {
    const response = await axiosClient.get(`${TICKETS_API_URL}/devices`);
    return response.data;
  } catch (error) {
    throw error
  }
}