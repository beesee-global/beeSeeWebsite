import axiosClient from "../../axiosClient";

const API_URL = "/website_configuration";

export const loginWebsiteConfigurationUser = async (data: { email: string; password: string }) => {
  const response = await axiosClient.post(`${API_URL}/login`, {
    email: data.email.trim().toLowerCase(),
    password: data.password.trim(),
  });
  return response.data;
};

export const fetchHomepageSettings = async () => {
  const response = await axiosClient.get(`${API_URL}/homepage/public`);
  return response.data?.data ?? response.data;
};

export const fetchHomepageSettingsAdmin = async () => {
  const response = await axiosClient.get(`${API_URL}/homepage`);
  return response.data?.data ?? response.data;
};

export const updateHomepageSettings = async (settings: Record<string, boolean>) => {
  const response = await axiosClient.put(`${API_URL}/homepage`, { settings });
  return response.data?.data ?? response.data;
};

export const fetchFeaturedProducts = async () => {
  const response = await axiosClient.get(`${API_URL}/featured-product`);
  return response;
};

export const fetchFeaturedProductByPid = async (pid: string | number) => {
  const response = await axiosClient.get(`${API_URL}/featured-product/${pid}`);
  return response;
};

export const fetchFeaturedProductsPublic = async () => {
  const response = await axiosClient.get(`${API_URL}/featured-product/public`);
  return response.data;
};

export const createWebsiteFeaturedProduct = async (formData: FormData) => {
  const response = await axiosClient.post(`${API_URL}/featured-product`, formData);
  return response;
};

export const updateWebsiteFeaturedProduct = async (id: number | string, formData: FormData) => {
  const response = await axiosClient.put(`${API_URL}/featured-product/${id}`, formData);
  return response;
};

export const deleteWebsiteFeaturedProduct = async (id: number | string) => {
  const response = await axiosClient.delete(`${API_URL}/featured-product/${id}`);
  return response;
};
