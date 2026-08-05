import axiosClient from "../../axiosClient";

const API_URL = "/ecom_users";

export const verifyEcomPassword = async (data: { email: string; password: string }) =>
  (await axiosClient.post("/ecom_auth/verify-password", data)).data;

export const fetchEcomUsers = async (id?: number | string) => {
  const response = await axiosClient.get(API_URL, {
    params: id !== undefined && id !== null ? { id } : undefined,
  });
  return response.data;
};

export const fetchEcomUserByPid = async (pid: number | string) => {
  const response = await axiosClient.get(`${API_URL}/by-pid/${pid}`);
  return response.data;
};

export const createEcomUser = async (payload: Record<string, unknown>) => {
  const response = await axiosClient.post(API_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateEcomUser = async (payload: { id: number | string; userData: Record<string, unknown> }) => {
  const response = await axiosClient.put(`${API_URL}/${payload.id}`, payload.userData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const deleteEcomUsers = async (ids: number[] | string[]) => {
  const response = await axiosClient.delete(API_URL, {
    data: { ids },
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
