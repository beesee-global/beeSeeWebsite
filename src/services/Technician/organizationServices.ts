import axiosClient from "../../axiosClient";

const API_URL = "/organization"

export const createOrganization = async(organizationData: any) => {
 try {
    const response = await axiosClient.post(`${API_URL}`, organizationData, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data
 } catch (error) {
    throw error;
 }  
}

export const fetchOrganization = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const deleteOrganization = async (ids: number[] | string[]) => {
    try {
        const response = await axiosClient.delete(`${API_URL}`, {
            data: { ids }
        });

        return response.data;
    } catch (error) {
        throw error
    }
}

export const updateOrganization = async (id: number, payload: any) => {
    try {
        const response = await axiosClient.put (`${API_URL}/${id}`, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response.data;
    } catch (error) {
        throw error;
    }
}