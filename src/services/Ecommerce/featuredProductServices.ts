import axiosClient from "../../axiosClient";
import { asArray, normalizeApiResponse } from "../../utils/apiCollections";

const API_URL = "/ecom_featured_product";

export const fetchFeaturedProducts = async () => asArray(await axiosClient.get(API_URL));
export const fetchFeaturedProductByPid = async (pid: string | number) =>
  normalizeApiResponse(await axiosClient.get(`${API_URL}/${pid}`));
export const fetchFeaturedProductsPublic = async () =>
  normalizeApiResponse(await axiosClient.get(`${API_URL}/public`));
export const createFeaturedProduct = async (formData: FormData) =>
  normalizeApiResponse(await axiosClient.post(API_URL, formData));
export const updateFeaturedProduct = async (id: number | string, formData: FormData) =>
  normalizeApiResponse(await axiosClient.put(`${API_URL}/${id}`, formData));
export const deleteFeaturedProduct = async (id: number | string) =>
  normalizeApiResponse(await axiosClient.delete(`${API_URL}/${id}`));
