import { error } from "console";
import axiosClient from "../../axiosClient";
import { asArray, normalizeApiResponse } from "../../utils/apiCollections";

const API_URL = "/users"

// Register user API call
export const registerUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`${API_URL}/register`, data);
    return response;
  } catch (error: any) {
    console.error("Register user failed:", error);
    throw error; // ✅ Re-throw the original Axios error (DO NOT wrap)
  }
};

export const loggedInUser = async (data: any) => {
  try {
    const response = await axiosClient.post(`/ecom_auth/login`, data);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw error
  }
}

export const fetchEcommerceUsers = async () => {
  const response = await axiosClient.get("/ecom_users");
  return asArray<EcommerceUser>(response);
};

export interface EcommerceUser {
  id: number | string;
  pid?: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: "regular" | "admin" | "superadmin" | string;
  positions_id?: number | string | null;
  position?: string | null;
  image_url?: string | null;
  status: "Active" | "Inactive" | string;
  phone?: string | null;
  address?: string | null;
}

export interface EcommercePosition {
  id: number | string;
  pid?: string;
  name: string;
  description?: string;
  is_protected?: boolean | number;
  permissions?: Array<Record<string, unknown>>;
}

export interface EcommerceUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role: string;
  positions_id?: number | string | null;
  status: string;
  phone?: string;
  address?: string;
}

export const fetchEcommerceUserById = async (id: string | number) => {
  const response = await axiosClient.get(`/ecom_users/${id}`);
  return normalizeApiResponse<EcommerceUser | null>(response);
};

export const createEcommerceUser = async (payload: EcommerceUserPayload) => {
  const response = await axiosClient.post("/ecom_users", payload);
  return response;
};

export const updateEcommerceUser = async (payload: { id: string | number; data: EcommerceUserPayload }) => {
  const response = await axiosClient.put(`/ecom_users/${payload.id}`, payload.data);
  return response;
};

export const deleteEcommerceUsers = async (ids: Array<string | number>) => {
  const response = await axiosClient.delete("/ecom_users", { data: { ids } });
  return response;
};

export const fetchEcommercePositions = async () => {
  const response = await axiosClient.get("/ecom_positions");
  return asArray<EcommercePosition>(response);
};
