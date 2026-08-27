import axiosClient from "../../axiosClient";
import { asArray } from "../../utils/apiCollections";
import type { EcommercePosition } from "./userServices";

const API_URL = "/ecom_positions";

export const fetchEcommercePositions = async (): Promise<EcommercePosition[]> => {
  const response = await axiosClient.get(API_URL);
  return asArray<EcommercePosition>(response);
};

export const createEcommercePosition = async (payload: { name: string; description: string }) => {
  const response = await axiosClient.post(API_URL, {
    ...payload,
    is_protected: 0,
    permissions: [],
  });
  return response;
};

export const updateEcommercePosition = async (payload: { id: number | string; name: string; description: string; permissions?: Array<Record<string, unknown>> }) => {
  const response = await axiosClient.put(`${API_URL}/${payload.id}`, {
    name: payload.name,
    description: payload.description,
    permissions: payload.permissions || [],
  });
  return response;
};

export const deleteEcommercePosition = async (id: number | string) => {
  const response = await axiosClient.delete(API_URL, { data: { ids: [id] } });
  return response;
};
