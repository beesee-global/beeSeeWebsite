import { Form } from "react-router-dom";
import axiosClient from "../../axiosClient";

const API_URL = '/tickets'

export const getTicket = async (status: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}`, { params: { status } });
        return response.data;
    } catch (error) {
        throw error
    }
}

export const deleteSpecificConversation = async (id: string) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/${id}/delete/message`);
        return response.data
    } catch (error) {
        throw error
    }
}

export const beforeAfterInsert = async (data: FormData) => {
    try {
        const response = await axiosClient.post(`${API_URL}/before-after`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        throw error
    }
}

export const saveRemarks = async (id: string, data: FormData) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${id}/remarks`, data, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
}

export const deleteBeforeAfterAttachment = async (data: any) => {
    try {
        const response = await axiosClient.delete(`${API_URL}/deleteBeforeAfterAttachment`, {
            data,
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
}

export const searchJobOrder = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/search-bar`);
        return response.data
    } catch (error) {
        throw error
    }
}

// export const updateStatusDelete = async (data: any) => {
//   try {
//       const response = await axiosClient.put(`${API_URL}/update-status-delete`, data);
//       return response.data
//   } catch (error) {
//       throw error
//   }
// }

export const sentJobOder = async (id: string , data:any) => {
    try {
      const response = await axiosClient.put(`${API_URL}/${id}/sent-job-order`, data, {
        headers:{
            "Content-Type": "multipart/form-data"
        }
      });
      return response.data
    } catch (error) {
        throw error
    }
}

export const updateSerialNumber = async (id: string, data: any) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${id}/update-serial-number`, data, {
            headers:{
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data
    } catch (error) {
        throw error
    }
}

export const uploadJobOrders = async (id: string , data:any) => {
    try {
      const response = await axiosClient.put(`${API_URL}/${id}/upload-job-order`, data, {
        headers:{
            "Content-Type": "multipart/form-data"
        }
      });
      return response.data
    } catch (error) {
        throw error
    }
}

// permanently delete a ticket or multiple tickets
// export const deleteForever = async (idOrIds: number | number[]) => {
//     try {
//         let response;
//         if (Array.isArray(idOrIds)) {
//             // bulk delete - send ids in request body
//             response = await axiosClient.delete(`${API_URL}/delete-forever`, { data: { ids: idOrIds } });
//         } else {
//             // single delete - id in path
//             response = await axiosClient.delete(`${API_URL}/delete-forever/${idOrIds}`);
//         }
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// }

// --- Main ---
export const fetchOpen = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}?status=open`)
        return response.data
    } catch (error) {
        throw error
    }
}

// ongoing
export const fetchOngoing = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}?status=ongoing`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchClosed = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}?status=closed`);
        return response.data
    } catch (error) {
        throw error;
    }
} 

export const fetchResolve = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}?status=resolved`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchDeviceType = async () => {
    try {
        const response = await axiosClient.get(`/categories/select-field`)
        return response.data
    } catch (error) {
        throw error;
    }
}

export const fetchTicketDetails = async (pid: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${pid}`)
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchTicketDetailsPublic = async (pid: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${pid}/public`)
        return response.data
    } catch (error) {
        throw error
    }
}


export const deleteTickets = async (payload: FormData | number[] | string[]) => {
  try {
    const response = await axiosClient.delete(`${API_URL}`, {
      data: payload instanceof FormData ? payload : { ids: payload },
      headers: payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const fetchConversation = async(id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}/conversations`);
        return response.data
    } catch (error) {
        throw error;
    }
}

export const fetchConversationPublic = async(id: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/${id}/conversations/public`);
        return response.data
    } catch (error) {
        throw error;
    }
}

export const insertConversation = async(conversationData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}/conversations/reply`, conversationData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data
    } catch (error) {
        throw error;
    }
}

export const insertConversationPublic = async(conversationData: any) => {
    try {
        const response = await axiosClient.post(`${API_URL}/conversations/reply/public`, conversationData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data
    } catch (error) {
        throw error;
    }
}

export const insertImageConversation = async(formData: FormData) => {
    try {
        const response = await axiosClient.post(`${API_URL}/conversations/attachment/reply`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data
    } catch (error) {
        throw error;
    }
}

export const updateStatus = async(reference_number: string, payload: any) => {
    try {
        const response = await axiosClient.put(`${API_URL}/${reference_number}/status`, payload, {
            headers: {
                "Content-Type" : "application/json"
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}


export const markAsClosed = async (data: FormData) => {
    try {
        const response = await axiosClient.put(`${API_URL}/mark-as-closed`, data, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data
    } catch (error) {
        throw error
    }
}

export const fetchStatus = async (status: string, orderBy: string, isClosed: string) => {
    try {
        const response = await axiosClient.get(`${API_URL}/status?status=${status}&orderBy=${orderBy}&statusConditionClosed=${isClosed}`);
        return response.data
    } catch (error) {
        throw error
    }
}