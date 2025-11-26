import { apiService } from "../config/api";

export const getConsolidatedReports = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }

    if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
    }

    if (filters.startDate) {
        params.append('startDate', filters.startDate);
    }

    if (filters.endDate) {
        params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = queryString ? `payments/reports?${queryString}` : 'payments/reports';

    const res = await apiService.get(url);
    return res.data;
};