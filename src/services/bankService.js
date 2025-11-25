import API, { apiService } from "../config/api";
import { toast } from "sonner";


// Add a bank account
export const addBankAccount = async ({ accountHolderName, accountNumber, ifsc, phone, accountType = "savings" }) => {
    const form = new FormData();
    form.append("accountHolderName", accountHolderName);
    form.append("accountNumber", accountNumber);
    form.append("ifsc", ifsc);
    if (phone) form.append("phone", phone);
    if (accountType) form.append("accountType", accountType);

    const res = await apiService.post("bank", form, { headers: { "Content-Type": "multipart/form-data" }, showSuccess: true });
    return res.data;
};

// List user's bank accounts
export const listBankAccounts = async () => {
    const res = await apiService.get("bank");
    return res.data;
};

// Verify a specific bank account
export const verifyBankAccount = async (accountId, payload = {}) => {
    const res = await apiService.post(`bank/verify/${accountId}`, payload, { showSuccess: true });
    return res.data;
};

// Get verification status for an account
export const getVerificationStatus = async (accountId) => {
    const res = await apiService.get(`bank/verify/status/${accountId}`);
    return res.data;
};

// Get all verification statuses for current user
export const getAllVerificationStatuses = async () => {
    const res = await apiService.get("bank/verify/statuses");
    return res.data;
};

// Supported banks
export const getSupportedBanks = async () => {
    const res = await apiService.get("bank/supported-banks");
    return res.data;
};

// Deactivate an account
export const deactivateBankAccount = async (accountId) => {
    const res = await apiService.patch(`bank/${accountId}/deactivate`);
    return res.data;
};

// Bulk verify accounts
export const bulkVerifyBankAccounts = async (accountIds, { phone } = {}) => {
    const form = new FormData();
    // support multiple values; backend handles both repeated keys and arrays
    accountIds.forEach((id) => form.append("accountIds", id));
    if (phone) form.append("phone", phone);
    const res = await apiService.post("bank/verify/bulk", form, { headers: { "Content-Type": "multipart/form-data" }, showSuccess: true });
    return res.data;
};

// Delete bank account
export const deleteBankAccount = async (accountId) => {
    const res = await apiService.delete(`bank/${accountId}`);
    return res.data;
};