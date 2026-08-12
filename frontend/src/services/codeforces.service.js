import api from "./api";

const codeforcesService = {
    connect: async (handle) => {
        const response = await api.post(
            "/codeforces/connect",
            { handle }
        );

        return response.data.data;
    },

    sync: async () => {
        const response = await api.post(
            "/codeforces/sync"
        );

        return response.data.data;
    },

    getSubmissions: async (params = {}) => {
        const response = await api.get(
            "/codeforces/submissions",
            { params }
        );

        return {
            data: response.data.data,
            pagination: response.data.pagination,
        };
    },

    getSubmission: async (id) => {
        const response = await api.get(
            `/codeforces/submissions/${id}`
        );

        return response.data.data.submission;
    },

    getContests: async (params = {}) => {
        const response = await api.get(
            "/codeforces/contests",
            { params }
        );

        return {
            data: response.data.data,
            pagination: response.data.pagination,
        };
    },

    getContest: async (id) => {
        const response = await api.get(
            `/codeforces/contests/${id}`
        );

        return response.data.data.contest;
    },

    getAnalytics: async () => {
        const response = await api.get(
            "/codeforces/analytics"
        );

        return response.data.data;
    },

    getDashboard: async () => {
        const response = await api.get(
            "/codeforces/dashboard"
        );

        return response.data.data;
    },

    unlink: async () => {
        const response = await api.delete(
            "/codeforces/unlink"
        );

        return response.data;
    },
};

export default codeforcesService;