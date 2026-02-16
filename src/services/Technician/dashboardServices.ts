import axiosClient from "../../axiosClient";

const API_URL = '/dashboard';

export const fetchGetStatsCategory = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/stats-category`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchGetOverview = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/overview`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchApplicants = async() => {
    try {
        const response = await axiosClient.get(`${API_URL}/applicants`);
        return response.data;
    } catch (error) {
        throw error
    }
}

export const fetchGetStatsDevice = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/stats-device`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const fetchCountDashboard = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/count-status`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCountMostlyIssue = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/count-mostly-issue`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchCountByMonth = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/count-status-by-month`);
        return response.data
    } catch (error) {
        throw error
    }
}