const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = require('../config/env');
const User = require('../models/user.model');
const Repository = require('../models/repository.model');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

const getGitHubAuthUrl = (state) => {
    const url = new URL("https://github.com/login/oauth/authorize");

    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);

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
    if (!response.ok) {
        throw new AppError(data.error_description || "Failed to exchange code", response.status);
    }
    return data.access_token;
};

const fetchGitHubProfile = async (accessToken) => {
    const response = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "User-Agent": "BeyondZenith-App",
            "Accept": "application/json"
        }
    });

    const data = await response.json();
    if (!response.ok) {
        throw new AppError(data.message || "Failed to fetch GitHub profile", response.status);
    }
    return data;
};

const connectGitHub = async (userId, profile, accessToken) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const existingUser = await User.findOne({
        "github.id": profile.id,
    });

    if (existingUser && !existingUser._id.equals(userId)) {
        throw new AppError("GitHub account already linked", 409);
    }

    user.github = {
        id: String(profile.id),
        username: profile.login,
        name: profile.name || null,
        avatarUrl: profile.avatar_url || null,
        profileUrl: profile.html_url || null,
        accessToken: encrypt(accessToken),
        connectedAt: new Date()
    };

    await user.save();
    return user;
};

const getDecryptedGitHubToken = (user) => {
    if (!user || !user.github || !user.github.accessToken) {
        return null;
    }
    return decrypt(user.github.accessToken);
};

const fetchGitHubRepositories = async (accessToken) => {
    let repositories = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const response = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "User-Agent": "BeyondZenith-App",
                "Accept": "application/json"
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new AppError(data.message || "Failed to fetch GitHub repositories", response.status);
        }

        if (!Array.isArray(data) || data.length === 0) {
            break;
        }

        repositories = repositories.concat(data);

        if (data.length < perPage) {
            break;
        }

        page++;
    }

    return repositories;
};

const normalizeRepositoryData = (repo, userId) => {
    return {
        owner: userId,
        githubRepoId: repo.id,
        name: repo.name,
        description: repo.description || null,
        language: repo.language || null,
        topics: Array.isArray(repo.topics) ? repo.topics : [],
        visibility: repo.visibility || (repo.private ? 'private' : 'public'),
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        watchers: repo.watchers_count ?? 0,
        size: repo.size ?? 0,
        defaultBranch: repo.default_branch || 'main',
        createdAtGithub: repo.created_at ? new Date(repo.created_at) : new Date(),
        updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : new Date(),
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : new Date(),
        htmlUrl: repo.html_url || '',
        isFork: Boolean(repo.fork),
        isArchived: Boolean(repo.archived),
    };
};

const syncGitHubRepositories = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const accessToken = getDecryptedGitHubToken(user);
    if (!accessToken) {
        throw new AppError("GitHub account not connected", 400);
    }

    const githubRepos = await fetchGitHubRepositories(accessToken);
    const normalizedRepos = githubRepos.map((repo) => normalizeRepositoryData(repo, userId));

    const githubRepoIds = normalizedRepos.map((repo) => repo.githubRepoId);

    if (normalizedRepos.length > 0) {
        const bulkOps = normalizedRepos.map((repoData) => ({
            updateOne: {
                filter: { owner: userId, githubRepoId: repoData.githubRepoId },
                update: { $set: repoData },
                upsert: true,
            },
        }));

        await Repository.bulkWrite(bulkOps, { ordered: false });
    }

    const deleteResult = await Repository.deleteMany({
        owner: userId,
        githubRepoId: { $nin: githubRepoIds },
    });

    return {
        totalFetched: githubRepos.length,
        totalSynced: normalizedRepos.length,
        deleted: deleteResult.deletedCount || 0,
    };
};

module.exports = {
    getGitHubAuthUrl,
    exchangeCodeForAccessToken,
    fetchGitHubProfile,
    connectGitHub,
    getDecryptedGitHubToken,
    fetchGitHubRepositories,
    normalizeRepositoryData,
    syncGitHubRepositories
};