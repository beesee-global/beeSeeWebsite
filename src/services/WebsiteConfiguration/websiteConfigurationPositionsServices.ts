import axiosClient from "../../axiosClient";

const API_URL = "/website_configuration_positions";
const unwrap = (body: any) => body?.data?.data ?? body?.data ?? body;

export const fetchWebsiteConfigurationPositions = async () => unwrap((await axiosClient.get(API_URL)).data);
export const createWebsiteConfigurationPosition = async (payload: any) => unwrap((await axiosClient.post(API_URL, payload)).data);
export const updateWebsiteConfigurationPosition = async (id: number | string, payload: any) => unwrap((await axiosClient.put(`${API_URL}/${id}`, payload)).data);
export const deleteWebsiteConfigurationPositions = async (payload: FormData | number[] | string[]) => {
  const ids = payload instanceof FormData ? JSON.parse(String(payload.get("ids") || "[]")) : payload;
  return unwrap((await axiosClient.delete(API_URL, { data: { ids } })).data);
};
