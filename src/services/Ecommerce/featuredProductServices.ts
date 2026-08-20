import axiosClient from "../../axiosClient";

const API_URL = "/ecom_featured_product";

export const fetchFeaturedProducts = async () => axiosClient.get(API_URL);
export const fetchFeaturedProductByPid = async (pid: string | number) => axiosClient.get(`${API_URL}/${pid}`);
export const fetchFeaturedProductsPublic = async () => (await axiosClient.get(`${API_URL}/public`)).data;
export const createFeaturedProduct = async (formData: FormData) => axiosClient.post(API_URL, formData);
export const updateFeaturedProduct = async (id: number | string, formData: FormData) => axiosClient.put(`${API_URL}/${id}`, formData);
export const deleteFeaturedProduct = async (id: number | string) => axiosClient.delete(`${API_URL}/${id}`);
