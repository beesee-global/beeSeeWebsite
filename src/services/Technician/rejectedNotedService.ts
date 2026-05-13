import axiosClient from "../../axiosClient";
import { InsertRejectedNoted, UpdateRejectedNoted } from "../../models/rejected_note"

const API = "/rejected_note";

export const fetchAllRejectedNotes = async () => {
    try {
        const response = await axiosClient.get(`${API}`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response as any
    } catch (error) {
        throw error
    }
}

export const insertRejectedNotes = async (formData: InsertRejectedNoted) => {
    try {
        const response = await axiosClient.post(`${API}`, formData, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response as any
    } catch (error) {
        throw error
    }
}

export const updateRejectedNotes = async (id: number | string, payload: UpdateRejectedNoted) => {
    try {
         const response = await axiosClient.put(`${API}/${id}/rejected_note_update`, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response as any
    } catch (error) {
        throw error
    }
}

export const deleteRejectedNotes = async (id: number | string) => {
    try {
         const response = await axiosClient.delete(`${API}/${id}/delete`, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response as any
    } catch (error) {
        throw error
    }
}
