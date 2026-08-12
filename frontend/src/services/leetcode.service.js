import api from "./api";

const leetcodeService = {
    connect: async (username) => {
        const response = await api.post("/leetcode/connect", {
            username,
        });

        return response.data.data;
    },

    sync: async () => {
        const response = await api.post("/leetcode/sync");

        return response.data.data;
    },

    getProfile: async () => {
        const response = await api.get("/leetcode/profile");

        return response.data.data;
    },

    getContests: async (params = {}) => {
        const response = await api.get("/leetcode/contests", {
            params,
        });

        return {
            data: response.data.data,
            pagination: response.data.pagination,
        };
    },

    getContest: async (contestId) => {
        const response = await api.get(
            `/leetcode/contests/${contestId}`
        );

        return response.data.data.contest;
    },

    getAnalytics: async () => {
        const response = await api.get("/leetcode/analytics");

        return response.data.data;
    },

    getDashboard: async () => {
        const response = await api.get("/leetcode/dashboard");

        return response.data.data;
    },

    unlink: async () => {
        const response = await api.delete("/leetcode/unlink");

        return response.data.data;
    },
};

export default leetcodeService;