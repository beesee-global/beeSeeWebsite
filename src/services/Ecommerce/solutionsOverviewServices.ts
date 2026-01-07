import axiosClient from "../../axiosClient";

const API_URL = "/solutions";

// post insert solution
export const createSolution = async (data: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
}

// delete solution
export const deleteSolution = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return response;
    } catch (error) {
        throw error
    }
}

// get all solutions
export const fetchAllSolutions = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// get specific solution
export const fetchSolutionByPid = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// put update solution
export const updateSolution = async (payload: { id: number | string, solutionData: FormData }) => {
    try {
        const { id, solutionData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, solutionData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
