import axiosClient from "../../axiosClient";
import { asArray } from "../../utils/apiCollections";

const TICKETS_API_URL = "/tickets";

// Public support lookups return `{ data: { success, data } }` from the API.
// Expose the inner payload to the form without changing the shared Axios
// response contract used by the rest of the application.
const unwrapSupportPayload = (response: any): any => {
  const body = response.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
};

export const createCustomerSupport = async (ticketData: any) => {
  try {
    const response = await axiosClient.post(`${TICKETS_API_URL}`, ticketData, {
      headers: {
        "Content-Type": "application/json",
      }
    });

    // The ticket endpoint currently wraps its payload as:
    // { data: { success: true, data: { ticket_id } } }.
    // Return the inner payload so callers can consistently use
    // response.success and response.data.ticket_id.
    return response.data?.data ?? response.data;
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
    if (id === null || id === undefined || String(id).trim() === "") {
      throw new Error("Cannot upload a ticket image without a ticket ID.");
    }

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
    return asArray(response);
  } catch (error) {
    throw error
  }
}

export const fetchDevices = async( id: number ) => {
  try {
    const response = await axiosClient.get(`/products/${id}/public`);
    return asArray(response)
  } catch(error) {
    throw error
  }
}

export const fetchIssue = async ( id: number ) => {
  try {
    const response = await axiosClient.get(`/issues/${id}/public`)
    return asArray(response)
  } catch (error) {
    throw error
  }
}

export const fetchDevice = async () => {
  try {
    const response = await axiosClient.get(`/products/public`);
    return asArray(response);
  } catch (error) {
    throw error;
  }
}
