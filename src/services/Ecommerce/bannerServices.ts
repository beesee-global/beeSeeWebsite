import axiosClient from '../../axiosClient';

// Base URL for banner endpoints
const BANNER_BASE_URL = '/banners';

// Interfaces
export interface Banner {
    id: number;
    title: string; 
    startDate: string;
    endDate: string;
    start_date?: string;
    end_date?: string;
    image: string;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
} 

// API Response Interface
interface BannerResponse {
    success: boolean;
    message: string;
    data: Banner[];
}

export interface UpdateBannerPayload {
    id: string | number;
    bannerData: FormData;
}

// Create banner
export const createBanner = async (bannerData: FormData): Promise<Banner> => {
    try {
        const response = await axiosClient.post<Banner>(`${BANNER_BASE_URL}`, bannerData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    return response.data;
    } catch (error) {
        throw error;
    }
};

// Fetch all banners
export const fetchAllBanners = async (): Promise<Banner[]> => {
    try {
        const response = await axiosClient.get<Banner[]>(`${BANNER_BASE_URL}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
 
// Fetch banner by ID
export const fetchBannerByPid = async (id: string | number): Promise<Banner> => {
    try {
        const response = await axiosClient.get<Banner>(`${BANNER_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update banner
export const updateBanner = async (payload: UpdateBannerPayload): Promise<Banner> => {
    try {
        const { id, bannerData } = payload;
        const response = await axiosClient.put<Banner>(`${BANNER_BASE_URL}/${id}`, bannerData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete banner
export const deleteBanner = async (id: string | number): Promise<void> => {
    try {
        await axiosClient.delete(`${BANNER_BASE_URL}/${id}`);
    } catch (error) {
        throw error;
    }
};

// Fetch active banners (for displaying on pages)
export const fetchActiveBanners = async () => {
    try {
        const response = await axiosClient.get(`${BANNER_BASE_URL}/public`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
