import axiosClient from "../../axiosClient";

const API_URL = "issues"

export interface Issues {
    id: number;
    name: string;
    categories_id: number;
    product_id: number
    possible_solutions: string;
    is_publish: string
}

export const fetchIssues = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchProducts = async (id: number) => {
    try {
        const response = await axiosClient.get(`/products/${id}/public`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCategory = async () => {
    try {
        const response = await axiosClient.get(`/categories/no_is_active`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchProductAll = async () => {
    try {
        const response = await axiosClient.get(`/products`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const createIssue = async (issue: Omit<Issues, "id">): Promise<Issues> => {
    try {
        const response = await axiosClient.post(`${API_URL}`, issue)
        return response.data
    } catch (error) {
        throw error
    }
}

// UPDATE user
export const updateIssues = async (id: number, issue: Omit<Issues, "id">): Promise<Issues> => {
  try {
	const res = await axiosClient.put(`${API_URL}/${id}`, issue);
    return res.data;
  } catch (err) {
  	throw err
  }
};

export const deleteIssues = async (ids: number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: { ids }  // send payload in `data` for DELETE
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
