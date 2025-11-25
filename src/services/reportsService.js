import { apiService } from "../config/api";

export const getConsolidatedReports = async () => {
    const res = await apiService.get("payments/reports");
    return res.data;
};
