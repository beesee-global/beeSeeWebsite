import axiosClient from "../../axiosClient";

const API_URL = "/journeys";

// post insert journey milestone
export const createJourney = async (data: any) => {
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

// delete journey milestone
export const deleteJourney = async (id: number | string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}`)
        return response;
    } catch (error) {
        throw error
    }
}

// get all journey milestones
export const fetchAllJourneys = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// get specific journey milestone
export const fetchJourneyById = async (id: number | string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error
    }
}

// put update journey milestone
export const updateJourney = async (payload: { id: number | string, journeyData: FormData }) => {
    try {
        const { id, journeyData } = payload;
        const response = await axiosClient.put(`${API_URL}/${id}`, journeyData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const OurJourneyPublic = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}/home`);
        return response.data
    } catch (error) {
        throw error
    }
}
