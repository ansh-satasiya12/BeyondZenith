import api from "./api";

export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

export const changePassword = async (passwords) => {
    const response = await api.patch("/auth/change-password", passwords);
    return response.data;
};