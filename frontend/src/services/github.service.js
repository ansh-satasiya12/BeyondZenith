import api from "./api";

const githubService = {
    getDashboard: async () => {
        const response = await api.get("/github/dashboard");
        return response.data.data;
    },

    syncRepositories: async () => {
        const response = await api.post("/github/sync");
        return response.data;
    },

    getRepositories: async (params = {}) => {
        const response = await api.get("/github/repositories", { params });
        return response.data.data;
    },

    getRepository: async (id) => {
        const response = await api.get(`/github/repositories/${id}`);
        return response.data.data.repository;
    },

    enhanceRepository: async (id) => {
        const response = await api.post(`/github/repositories/${id}/enhance`);
        return response.data.data.repository;
    },

    getAnalytics: async () => {
        const response = await api.get("/github/analytics");
        return response.data.data;
    },

    syncProfile: async () => {
        const response = await api.post("/github/profile/sync");
        return response.data.data.profile;
    },
};

export default githubService;