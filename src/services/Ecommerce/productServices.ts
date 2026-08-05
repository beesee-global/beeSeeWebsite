import axiosClient from "../../axiosClient";

const API_URL = "/ecom_products"

// post inserting product
export const createProduct = async (data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data, {
            // Let Axios/browser set the multipart boundary automatically.
        })
        return response;
    } catch (error) {
        throw error
    }
} 

// delete product 
export const deleteProduct = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return response;
    } catch (error) {
        throw error
    }
}

// get all product 
export const fetchAllProduct = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// get all product public 
export const fetchAllProductPublic = async () => {
  const response = await axiosClient.get(`${API_URL}/public`);
  return response.data;
};

export const fetchSpecificProductPublic = async (id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}/public`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// get Specific product
export const fetchSpecificProduct = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
       throw error
    }
}

// put update product 
export const updateProduct = async (payload: {id: number | string, productData: FormData}) => {
    try {
        const { id, productData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, productData, {
            // Let Axios/browser set the multipart boundary automatically.
        });
        return response.data;
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

export const deleteProductSpecsHighlight = async (id: number | string) => {
    const response = await axiosClient.delete(`${API_URL}/${id}/specs-highlight`);
    return response.data;
};

export const updateProductVisibility = async (id: number | string, visibility: { video_enabled?: boolean; brochure_enabled?: boolean; product_enabled?: boolean }) => {
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
        return Array.isArray(response.data?.data) ? response.data.data : response.data;
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
