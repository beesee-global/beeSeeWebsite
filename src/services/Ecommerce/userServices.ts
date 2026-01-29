import { error } from "console";
import axiosClient from "../../axiosClient";

const API_URL = "/users"

// Register user API call
export const registerUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/register`, data);
    return response.data; // ✅ axiosClient already handles data
  } catch (error: any) {
    console.error("Register user failed:", error);
    throw error; // ✅ Re-throw the original Axios error (DO NOT wrap)
  }
};

export const loggedInUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`/ecom_auth/login`, data);
    return response.data;
  } catch (error) {
    throw error
  }
}
