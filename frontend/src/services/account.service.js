import api from "./api";

export const unlinkGitHub = async () => {
    const response = await api.delete("/github/unlink");
    return response.data;
};

export const connectCodeforces = async (handle) => {
    const response = await api.post("/codeforces/connect", { handle });
    return response.data;
};

export const unlinkCodeforces = async () => {
    const response = await api.delete("/codeforces/unlink");
    return response.data;
};

export const connectLeetCode = async (username) => {
    const response = await api.post("/leetcode/connect", { username });
    return response.data;
};

export const unlinkLeetCode = async () => {
    const response = await api.delete("/leetcode/unlink");
    return response.data;
};

export const getGitHubConnectUrl = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
    return `${baseURL}/github/connect`;
};
