const oauthStore = new Map();
const EXPIRATION_TIME_MS = 5 * 60 * 1000; // 5 minutes

const saveOAuthState = (state, userId) => {
    const expiresAt = Date.now() + EXPIRATION_TIME_MS;
    oauthStore.set(state, { userId, expiresAt });
};

const getOAuthState = (state) => {
    if (!state) return null;
    const data = oauthStore.get(state);
    if (!data) return null;

    if (Date.now() > data.expiresAt) {
        oauthStore.delete(state);
        return null;
    }

    return data;
};

const deleteOAuthState = (state) => {
    if (state) {
        oauthStore.delete(state);
    }
};

module.exports = {
    saveOAuthState,
    getOAuthState,
    deleteOAuthState,
};
