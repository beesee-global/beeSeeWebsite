import axios from "axios";

const API_URL = "/faqs";

// post inserting faqs
export const createFaqs = async (data: any) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create FAQ");
  }
};




