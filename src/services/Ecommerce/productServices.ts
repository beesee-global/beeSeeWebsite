import axiosClient from "../../axiosClient";
import { asArray, normalizeApiResponse } from "../../utils/apiCollections";

const API_URL = "/ecom_products"

// post inserting product
export const createProduct = async (data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data, {
            // Let Axios/browser set the multipart boundary automatically.
        })
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
} 

// delete product 
export const deleteProduct = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
}

// get all product 
export const fetchAllProduct = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
}

// get all product public 
export const fetchAllProductPublic = async () => {
  const response = await axiosClient.get(`${API_URL}/public`);
  return normalizeApiResponse(response);
};

export const fetchSpecificProductPublic = async (id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}/public`);
        return normalizeApiResponse(response);
    } catch (error) {
        throw error
    }
}

// get Specific product
export const fetchSpecificProduct = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return normalizeApiResponse(response);
    } catch (error) {
       throw error
    }
}

// put
export const updateProduct = async (payload: {id: number | string, productData: FormData}) => {
    try {
        const { id, productData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, productData, {
            // Let Axios/browser set the multipart boundary automatically.
        });
        return normalizeApiResponse(response);
    } catch (error) {
       throw error
    }
} 

export const deleteProductVideo = async (id: number | string) => {
    const response = await axiosClient.delete(`${API_URL}/${id}/video`);
    return response.data;
};

export const deleteProductBrochure = async (id: number | string) => {
    const response = await axiosClient.delete(`${API_URL}/${id}/brochure`);
    return response.data;
};

export const deleteProductBrochureItem = async (productId: number | string, brochureId: number | string) => {
    const response = await axiosClient.delete(`${API_URL}/${productId}/brochures/${brochureId}`);
    return response.data;
};

export const fetchPublicProductBrochures = async (pid: string) => {
    const response = await axiosClient.get(`${API_URL}/${encodeURIComponent(pid)}/brochures`);
    return response.data;
};

export const deleteProductSpecsHighlight = async (id: number | string) => {
    const response = await axiosClient.delete(`${API_URL}/${id}/specs-highlight`);
    return response.data;
};

export const updateProductVisibility = async (id: number | string, visibility: {
    basic_information_enabled?: boolean;
    details_enabled?: boolean;
    gallery_enabled?: boolean;
    quick_product_highlight_enabled?: boolean;
    specifications_enabled?: boolean;
    video_enabled?: boolean;
    brochure_enabled?: boolean;
    product_enabled?: boolean;
    product_specs_highlight_enabled?: boolean;
}) => {
    const response = await axiosClient.patch(`${API_URL}/${id}/visibility`, visibility);
    return response.data;
};

// search Specific product
export const searchProduct = async (term: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}?search=${encodeURIComponent(term)}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// fetching category 
export const fetchCategory = async () => {
    try {
        const response = await axiosClient.get("/ecom_category");
        return asArray(response);
    } catch (error) {
        throw error
    }
}

export const countProduct = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/count`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const ProductsPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/home`)
        return response.data
    } catch (error) {
        throw error
    }
}


export const fetchByPidPublic = async (pid: string | number) => {
    try {
        const response = await axiosClient.get(`${API_URL}/public/${pid}/home`);
        return response.data
    } catch (error) {
        throw error;
    }
}
