import { apiService } from "../config/api";
import { mapCashfreeStatus } from "./utils";



// Create payout request
export const createPayoutRequest = async ({ amount, bankAccountId, remarks }) => {
    const res = await apiService.post("payouts", {
        amount: Number(amount),
        bankAccountId,
        remarks
    }, {
        showSuccess: true,
    });

    // Use cashfreeStatus directly
    if (res.data && res.data.payout) {
        res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
    }

    return res.data;
};

// Get user's payout requests
export const getUserPayouts = async ({ page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit });

    const res = await apiService.get(`payouts?${params.toString()}`);

    // Use cashfreeStatus directly
    if (res.data && res.data.payouts && Array.isArray(res.data.payouts)) {
        res.data.payouts = res.data.payouts.map(payout => ({
            ...payout,
            displayStatus: mapCashfreeStatus(payout.cashfreeStatus)
        }));
    }

    return res.data;
};

// Get specific payout status
export const getPayoutStatus = async (payoutId) => {
    const res = await apiService.get(`payouts/${payoutId}`);

    // Use cashfreeStatus directly
    if (res.data && res.data.payout) {
        res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
    }

    return res.data;
};

// Check Cashfree transfer status
export const checkCashfreeTransferStatus = async (payoutId) => {
    try {
        const res = await apiService.get(`payouts/${payoutId}/check-status`);

        // Use cashfreeStatus directly
        if (res.data && res.data.payout) {
            res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
        }

        return res.data;
    } catch (error) {
        // Handle specific Cashfree errors
        if (error.response?.data?.code === 'transfer_id does not exist') {
            throw new Error('Transfer not found in Cashfree. The payout may not have been processed yet.');
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else {
            throw new Error('Failed to check transfer status from Cashfree');
        }
    }
};