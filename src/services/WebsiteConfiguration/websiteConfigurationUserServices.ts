import axiosClient from "../../axiosClient";

const API_URL = "/website_configuration/users";

export const verifyWebsiteConfigurationPassword = async (data: { email: string; password: string }) =>
  (await axiosClient.post("/website_configuration/verify-password", data)).data;

export const fetchWebsiteConfigurationUsers = async (id?: number | string) => {
  const response = await axiosClient.get(API_URL, {
    params: id !== undefined && id !== null ? { id } : undefined,
  });
  return response.data;
};

export const fetchWebsiteConfigurationUserByPid = async (pid: number | string) => {
  const response = await axiosClient.get(`${API_URL}/by-pid/${pid}`);
  return response.data;
};

export const fetchWebsiteConfigurationUserById = async (id: number | string) => {
  const response = await axiosClient.get(`${API_URL}/${id}`);
  return response.data;
};

export const createWebsiteConfigurationUser = async (payload: Record<string, unknown>) => {
  const response = await axiosClient.post(API_URL, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateWebsiteConfigurationUser = async (payload: { id: number | string; userData: Record<string, unknown> }) => {
  const response = await axiosClient.put(`${API_URL}/${payload.id}`, payload.userData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const deleteWebsiteConfigurationUsers = async (ids: number[] | string[]) => {
  const response = await axiosClient.delete(API_URL, {
    data: { ids },
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
