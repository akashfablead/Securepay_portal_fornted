import { apiService } from "../config/api";

export async function listMyNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (unreadOnly) params.set("unreadOnly", "true");
    const res = await apiService.get(`/notifications?${params.toString()}`);
    return res.data?.data;
}

export async function markAsRead(notificationId) {
    const res = await apiService.post(`/notifications/${notificationId}/read`);
    return res.data?.data;
}

export async function markAllAsRead() {
    const res = await apiService.post(`/notifications/read-all`);
    return res.data;
}

export async function getUnreadCount() {
    const data = await listMyNotifications({ page: 1, limit: 1, unreadOnly: true });
    return data?.total || 0;
}


