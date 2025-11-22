import axios from "axios";
import { errorHandler } from "../services/errorHandler";
import { toast } from "sonner";

// Base URLs from environment variables
export const BASE_URL = import.meta.env.VITE_BASE_URL;

// API endpoints
const API = {
  BASE_URL,

  ENDPOINTS: {
    register: "auth/register",
    login: "auth/login",
    // Auth/profile
    profile: "auth/profile",
    changePassword: "auth/change-password",
    deactivateAccount: "auth/deactivate-account",
    deleteAccount: "auth/account",
    dashboard: "auth/dashboard",
    // KYC endpoints
    kycSubmit: "kyc/submit",
    kycStatus: "kyc/status",
    kycRetry: "kyc/retry",
    // Retailer management (admin/master)
    adminUsers: "auth/admin/users",
    adminUserDetails: "auth/admin/users/:userId",
    adminUserStatus: "auth/admin/users/:userId/status",
    createRetailer: "auth/create-retailer",
    // Support
    supportContact: "support/contact",
  },
};

// export const apiService = axios.create({
//   baseURL: "/api",
// });

// Axios instance → always uses proxy (/api → backend)
export const apiService = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor → handle errors globally
apiService.interceptors.response.use(
  (response) => {
    // Optionally show success messages globally when opted-in
    if (response?.config?.showSuccess && response?.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    errorHandler(error); // send to ErrorContext
    return Promise.reject(error);
  }
);
export default API;
