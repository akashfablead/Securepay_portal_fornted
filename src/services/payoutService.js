import { apiService } from "../config/api";

// Function to map Cashfree status to display status
export const mapCashfreeStatus = (cashfreeStatus) => {
    switch (cashfreeStatus) {
        case 'SUCCESS':
            return 'completed';
        case 'FAILED':
        case 'REVERSED':
            return 'failed';
        case 'PROCESSING':
        case 'RECEIVED':
        case 'PENDING':
            return 'processing';
        default:
            return 'pending';
    }
};

// Create payout request
export const createPayoutRequest = async ({ amount, bankAccountId, remarks }) => {
    const res = await apiService.post("payouts", {
        amount: Number(amount),
        bankAccountId,
        remarks
    }, {
        showSuccess: true,
    });

    // Use cashfreeStatus if available, otherwise use status
    if (res.data && res.data.payout) {
        if (res.data.payout.cashfreeStatus) {
            res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
        } else {
            res.data.payout.displayStatus = res.data.payout.status;
        }
    }

    return res.data;
};

// Get user's payout requests
export const getUserPayouts = async ({ page = 1, limit = 10, status } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);

    const res = await apiService.get(`payouts?${params.toString()}`);

    // Use cashfreeStatus if available, otherwise use status
    if (res.data && res.data.payouts && Array.isArray(res.data.payouts)) {
        res.data.payouts = res.data.payouts.map(payout => {
            if (payout.cashfreeStatus) {
                return {
                    ...payout,
                    displayStatus: mapCashfreeStatus(payout.cashfreeStatus)
                };
            }
            return {
                ...payout,
                displayStatus: payout.status
            };
        });
    }

    return res.data;
};

// Get specific payout status
export const getPayoutStatus = async (payoutId) => {
    const res = await apiService.get(`payouts/${payoutId}`);

    // Use cashfreeStatus if available, otherwise use status
    if (res.data && res.data.payout) {
        if (res.data.payout.cashfreeStatus) {
            res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
        } else {
            res.data.payout.displayStatus = res.data.payout.status;
        }
    }

    return res.data;
};

// Check Cashfree transfer status
export const checkCashfreeTransferStatus = async (payoutId) => {
    try {
        const res = await apiService.get(`payouts/${payoutId}/check-status`);

        // Use cashfreeStatus if available, otherwise use status
        if (res.data && res.data.payout) {
            if (res.data.payout.cashfreeStatus) {
                res.data.payout.displayStatus = mapCashfreeStatus(res.data.payout.cashfreeStatus);
            } else {
                res.data.payout.displayStatus = res.data.payout.status;
            }
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