 import axiosClient from "../../axiosClient";

const API_URL = "/ecom_products"

// post inserting product
export const createProduct = async (data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
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
        return response;
    } catch (error) {
        throw error
    }
}

// get all product public 
export const fetchAllProductPublic = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/public`);
        return response;
    } catch (error) {
        throw error
    }
}

export const fetchSpecificProductPublic = async (id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}/public`);
        return response;
    } catch (error) {
        throw error
    }
}

// get Specific product
export const fetchSpecificProduct = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response;
    } catch (error) {
       throw error
    }
}

// put update product 
export const updateProduct = async (payload: {id: number | string, productData: FormData}) => {
    try {
        const { id, productData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, productData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data;
    } catch (error) {
       throw error
    }
} 

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
        return response.data
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