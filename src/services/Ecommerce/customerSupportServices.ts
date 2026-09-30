import axiosClient from "../../axiosClient";
import { normalizeApiResponse } from "../../utils/apiCollections";

const TICKETS_API_URL = "/tickets";
const CATEGORIES_API_URL = "/categories";

export const createCustomerSupport = async (ticketData: any) => {
  try {
    const response = await axiosClient.post(`${TICKETS_API_URL}/customer-support`, ticketData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    return normalizeApiResponse(response);
  } catch (error) {
    throw error;
  }
}

export const fetchDevice = async () => {
  try {
    // Device types are stored in the ticketing-system `categories` table.
    // There is no `/tickets/devices` endpoint; that path is interpreted as a
    // ticket id by the backend.
    const response = await axiosClient.get(`${CATEGORIES_API_URL}/select-field`);
    return response.data;
  } catch (error) {
    throw error
  }
}
