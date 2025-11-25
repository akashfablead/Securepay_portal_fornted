// Function to map Cashfree status to display status
export const mapCashfreeStatus = (cashfreeStatus) => {
    switch (cashfreeStatus) {
        case 'SUCCESS':
        case 'COMPLETED':
            return 'completed';
        case 'SENT_TO_BENEFICIARY':
            return 'sent_to_beneficiary';
        case 'FAILED':
            return 'failed';
        case 'REVERSED':
            return 'reversed';
        case 'REJECTED':
            return 'rejected';
        case 'RECEIVED':
            return 'received';
        case 'APPROVAL_PENDING':
            return 'approval_pending';
        case 'PENDING':
            return 'pending';
        case 'PROCESSING':
            return 'processing';
        default:
            return 'unknown';
    }
};