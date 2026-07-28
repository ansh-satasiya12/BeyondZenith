const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = require('../config/env');

const getGitHubAuthUrl = () => {
    const url = new URL("https://github.com/login/oauth/authorize");

    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
    url.searchParams.set("scope", "read:user user:email");

    return url.toString();
};

const exchangeCodeForAccessToken = async (code) => {
    const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code
        })
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }
    return data.access_token;
}

module.exports = {
    getGitHubAuthUrl,
    exchangeCodeForAccessToken
};