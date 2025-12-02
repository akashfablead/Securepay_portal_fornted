import API, { apiService } from "../config/api";

// Register API
export const register = async (payload) => {
  const formData = new FormData();
  for (const key in payload) {
    formData.append(key, payload[key]);
  }
  const res = await apiService.post(`${API.ENDPOINTS.register}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showSuccess: true,
  });
  return res.data; // { token, user }
};

// Login API
export const login = async (credentials) => {
  const formData = new FormData();
  for (const key in credentials) {
    formData.append(key, credentials[key]);
  }
  const res = await apiService.post(`${API.ENDPOINTS.login}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showSuccess: true,
  });
  return res.data;
};

// Get profile
export const getProfile = async () => {
  const res = await apiService.get(API.ENDPOINTS.profile);
  return res.data.user;
};

// Update profile
export const updateUserProfile = async (profileData) => {
  const formData = new FormData();
  const allowed = [
    "mobileNumber",
    "gender",
    "address",
    "city",
    "state",
    "country",
    "pincode",
    "fullName"
  ];
  for (const key of allowed) {
    if (profileData[key] !== undefined && profileData[key] !== null) {
      formData.append(key, String(profileData[key]));
    }
  }
  if (profileData.profileImage instanceof File || profileData.profileImage instanceof Blob) {
    formData.append("profileImage", profileData.profileImage);
  }
  const res = await apiService.put(API.ENDPOINTS.profile, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    showSuccess: true,
  });
  return res.data.user;
};

// Change password
export const changePassword = async (passwordData) => {
  const res = await apiService.post(API.ENDPOINTS.changePassword, passwordData, {
    showSuccess: true,
  });
  return res.data;
};

export const deactivateAccount = async () => {
  const res = await apiService.post(API.ENDPOINTS.deactivateAccount);
  return res.data;
};

export const deleteAccount = async () => {
  const res = await apiService.delete(API.ENDPOINTS.deleteAccount);
  return res.data;
};

export const getDashboard = async () => {
  const res = await apiService.get(API.ENDPOINTS.dashboard);
  return res.data.data;
};

export const listManagedUsers = async ({ page, limit, search, status, role } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (role) params.set("role", role);
  const queryString = params.toString();
  const url = queryString
    ? `${API.ENDPOINTS.adminUsers}?${queryString}`
    : API.ENDPOINTS.adminUsers;
  const res = await apiService.get(url);
  return res.data;
};

export const createRetailerAccount = async (formData) => {
  const res = await apiService.post(API.ENDPOINTS.createRetailer, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showSuccess: true,
  });
  return res.data?.data;
};

export const updateUserStatus = async ({ userId, isActive }) => {
  const endpoint = API.ENDPOINTS.adminUserStatus.replace(":userId", userId);
  const res = await apiService.patch(
    endpoint,
    { isActive },
    { showSuccess: true }
  );
  return res.data?.data;
};

// Get user details
export const getUserDetails = async (userId) => {
  const endpoint = API.ENDPOINTS.adminUserDetails.replace(":userId", userId);
  const res = await apiService.get(endpoint);
  return res.data?.data;
};

// Update user details
export const updateUserDetails = async (userId, userData) => {
  const endpoint = API.ENDPOINTS.adminUserDetails.replace(":userId", userId);
  const formData = new FormData();

  // Add user data to form
  Object.keys(userData).forEach(key => {
    if (userData[key] !== undefined && userData[key] !== null) {
      formData.append(key, userData[key]);
    }
  });

  const res = await apiService.put(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    showSuccess: true
  });
  return res.data?.data;
};

// Reset user password
export const resetUserPassword = async (userId, newPassword) => {
  const endpoint = API.ENDPOINTS.adminUserStatus.replace(":userId", userId);
  const res = await apiService.patch(
    endpoint,
    { newPassword },
    { showSuccess: true }
  );
  return res.data?.data;
};