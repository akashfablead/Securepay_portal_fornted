import { apiService } from "../config/api";

export const createOrder = async ({ amount, currency = "INR", customer }) => {
    const form = new FormData();
    form.append("amount", String(amount));
    if (currency) form.append("currency", currency);
    if (customer && typeof customer === "object") {
        Object.entries(customer).forEach(([k, v]) => {
            if (v !== undefined && v !== null) form.append(`customer[${k}]`, String(v));
        });
    }
    const res = await apiService.post("payments/order", form, {
        headers: { "Content-Type": "multipart/form-data" },
        showSuccess: true,
    });
    return res.data;
};

export const verifyPayment = async ({ orderId }) => {
    const form = new FormData();
    form.append("orderId", orderId);
    const res = await apiService.post("payments/verify", form, {
        headers: { "Content-Type": "multipart/form-data" },
        showSuccess: true,
    });
    return res.data;
};

export const getOrderHistory = async () => {
    const res = await apiService.get("payments/history");
    return res.data;
};


