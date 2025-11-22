import API, { apiService } from "../config/api";

// Submit KYC documents
export const submitKYC = async (documents) => {
    const formData = new FormData();

    // Append documents to form data
    if (documents.panCard) {
        formData.append('panCard', documents.panCard);
    }
    if (documents.aadhaarCard) {
        formData.append('aadhaarCard', documents.aadhaarCard);
    }
    if (documents.selfie) {
        formData.append('selfie', documents.selfie);
    }

    const res = await apiService.post(API.ENDPOINTS.kycSubmit, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        showSuccess: true,
    });
    return res.data;
};

// Get KYC status
export const getKYCStatus = async () => {
    const res = await apiService.get(API.ENDPOINTS.kycStatus);
    return res.data;
};

// Retry KYC verification
export const retryKYCVerification = async () => {
    const res = await apiService.post(API.ENDPOINTS.kycRetry, {}, {
        showSuccess: true,
    });
    return res.data;
};

