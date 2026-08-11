const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = require('../config/env');
const User = require('../models/user.model');
const Repository = require('../models/repository.model');
const AppError = require('../utils/AppError');
const { encrypt, decrypt } = require('../utils/encryption');

const getGitHubAuthUrl = (state) => {
    const url = new URL("https://github.com/login/oauth/authorize");

    url.searchParams.set("client_id", GITHUB_CLIENT_ID);
    url.searchParams.set("redirect_uri", GITHUB_CALLBACK_URL);
    url.searchParams.set("scope", "read:user user:email repo");
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

const VALID_SORT_FIELDS = ['name', 'stars', 'forks', 'updatedAtGithub', 'createdAtGithub'];

const getRepositories = async (userId, query = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'updatedAtGithub',
        order = 'desc',
        language,
        visibility,
        isFork,
        isArchived,
        search,
    } = query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = { owner: userId };

    if (language) {
        filter.language = language;
    }

    if (visibility) {
        filter.visibility = visibility;
    }

    if (isFork !== undefined) {
        filter.isFork = isFork === 'true' || isFork === true;
    }

    if (isArchived !== undefined) {
        filter.isArchived = isArchived === 'true' || isArchived === true;
    }

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const sortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'updatedAtGithub';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [repositories, totalItems] = await Promise.all([
        Repository.find(filter).sort(sort).skip(skip).limit(parsedLimit).lean(),
        Repository.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return {
        repositories,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            totalItems,
            totalPages,
        },
    };
};

const getRepositoryById = async (userId, repositoryId) => {
    const repository = await Repository.findOne({
        _id: repositoryId,
        owner: userId,
    }).lean();

    if (!repository) {
        throw new AppError("Repository not found", 404);
    }

    return repository;
};

const getRepositoryAnalytics = async (userId) => {
    const ownerObjectId = new (require('mongoose').Types.ObjectId)(userId);

    const [result] = await Repository.aggregate([
        { $match: { owner: ownerObjectId } },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            public: {
                                $sum: { $cond: [{ $eq: ['$visibility', 'public'] }, 1, 0] },
                            },
                            private: {
                                $sum: { $cond: [{ $eq: ['$visibility', 'private'] }, 1, 0] },
                            },
                            forked: {
                                $sum: { $cond: ['$isFork', 1, 0] },
                            },
                            archived: {
                                $sum: { $cond: ['$isArchived', 1, 0] },
                            },
                        },
                    },
                ],
                metrics: [
                    {
                        $group: {
                            _id: null,
                            totalStars: { $sum: '$stars' },
                            totalForks: { $sum: '$forks' },
                            totalWatchers: { $sum: '$watchers' },
                            totalSize: { $sum: '$size' },
                        },
                    },
                ],
                languageDistribution: [
                    { $match: { language: { $ne: null } } },
                    {
                        $group: {
                            _id: '$language',
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { count: -1 } },
                    {
                        $project: {
                            _id: 0,
                            language: '$_id',
                            count: 1,
                        },
                    },
                ],
                topRepositories: [
                    { $sort: { stars: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            stars: 1,
                            forks: 1,
                            language: 1,
                            htmlUrl: 1,
                        },
                    },
                ],
                recentRepositories: [
                    { $sort: { updatedAtGithub: -1 } },
                    { $limit: 5 },
                    {
                        $project: {
                            _id: 0,
                            name: 1,
                            stars: 1,
                            forks: 1,
                            language: 1,
                            htmlUrl: 1,
                            updatedAtGithub: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const summaryDoc = result.summary[0] || {};
    const metricsDoc = result.metrics[0] || {};

    return {
        summary: {
            total: summaryDoc.total || 0,
            public: summaryDoc.public || 0,
            private: summaryDoc.private || 0,
            forked: summaryDoc.forked || 0,
            archived: summaryDoc.archived || 0,
        },
        metrics: {
            totalStars: metricsDoc.totalStars || 0,
            totalForks: metricsDoc.totalForks || 0,
            totalWatchers: metricsDoc.totalWatchers || 0,
            totalSize: metricsDoc.totalSize || 0,
        },
        languageDistribution: result.languageDistribution,
        topRepositories: result.topRepositories,
        recentRepositories: result.recentRepositories,
    };
};

const getGitHubDashboard = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const analytics = await getRepositoryAnalytics(userId);

    return {
        profile: {
            id: user.github?.id || null,
            username: user.github?.username || null,
            name: user.github?.name || null,
            avatarUrl: user.github?.avatarUrl || null,
            profileUrl: user.github?.profileUrl || null,
            connectedAt: user.github?.connectedAt || null,
            followers: user.github?.followers || 0,
            following: user.github?.following || 0,
            publicRepos: user.github?.publicRepos || 0,
            publicGists: user.github?.publicGists || 0,
        },
        summary: analytics.summary,
        metrics: analytics.metrics,
        languageDistribution: analytics.languageDistribution,
        topRepositories: analytics.topRepositories,
        recentRepositories: analytics.recentRepositories,
    };
};

const fetchRepositoryLanguages = async (accessToken, owner, repoName) => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/languages`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "BeyondZenith-App",
                Accept: "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new AppError(
            data.message || "Failed to fetch repository languages",
            response.status
        );
    }

    return data;
};

const fetchRepositoryReadme = async (accessToken, owner, repoName) => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/readme`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "BeyondZenith-App",
                Accept: "application/json",
            },
        }
    );

    if (response.status === 404) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new AppError(
            data.message || "Failed to fetch repository README",
            response.status
        );
    }

    return Buffer.from(data.content, "base64").toString("utf8");
};

const fetchDefaultBranchInfo = async (
    accessToken,
    owner,
    repoName,
    defaultBranch
) => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/branches/${defaultBranch}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "BeyondZenith-App",
                Accept: "application/json",
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new AppError(
            data.message || "Failed to fetch branch information",
            response.status
        );
    }

    return {
        latestCommitSha: data.commit.sha,
        latestCommitUrl: data.commit.url,
    };
};

const enhanceRepository = async (userId, repositoryId) => {
    const [user, repository] = await Promise.all([
        User.findById(userId),
        Repository.findOne({
            _id: repositoryId,
            owner: userId,
        }),
    ]);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!repository) {
        throw new AppError("Repository not found", 404);
    }

    const accessToken = getDecryptedGitHubToken(user);

    if (!accessToken) {
        throw new AppError("GitHub account not connected", 400);
    }

    const owner = user.github.username;

    const [languageBreakdown, readme, branchInfo] = await Promise.all([
        fetchRepositoryLanguages(accessToken, owner, repository.name),
        fetchRepositoryReadme(accessToken, owner, repository.name),
        fetchDefaultBranchInfo(
            accessToken,
            owner,
            repository.name,
            repository.defaultBranch
        ),
    ]);

    repository.languageBreakdown = languageBreakdown;
    repository.readme = readme;
    repository.latestCommitSha = branchInfo.latestCommitSha;
    repository.latestCommitUrl = branchInfo.latestCommitUrl;

    await repository.save();

    return repository;
};

const fetchOrganizations = async (accessToken) => {
    const response = await fetch("https://api.github.com/user/orgs", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "BeyondZenith-App",
            Accept: "application/json",
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new AppError(
            data.message || "Failed to fetch organizations",
            response.status
        );
    }

    return data.map((org) => ({
        id: String(org.id),
        login: org.login,
        avatarUrl: org.avatar_url,
        url: org.url,
    }));
};

const fetchPinnedRepositories = async (accessToken) => {
    const query = `
        query {
            viewer {
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            id
                            name
                            description
                            url
                            stargazerCount
                            primaryLanguage {
                                name
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "BeyondZenith-App",
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
        throw new AppError(
            data.errors?.[0]?.message || "Failed to fetch pinned repositories",
            response.status || 500
        );
    }

    return data.data.viewer.pinnedItems.nodes.map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stars: repo.stargazerCount,
        language: repo.primaryLanguage?.name || null,
        htmlUrl: repo.url,
    }));
};

const syncGitHubProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const accessToken = getDecryptedGitHubToken(user);

    if (!accessToken) {
        throw new AppError("GitHub account not connected", 400);
    }

    const [profile, organizations, pinnedRepositories] = await Promise.all([
        fetchGitHubProfile(accessToken),
        fetchOrganizations(accessToken),
        fetchPinnedRepositories(accessToken),
    ]);

    user.github.followers = profile.followers ?? 0;
    user.github.following = profile.following ?? 0;
    user.github.publicRepos = profile.public_repos ?? 0;
    user.github.publicGists = profile.public_gists ?? 0;
    user.github.organizations = organizations;
    user.github.pinnedRepositories = pinnedRepositories;

    await user.save();

    return {
        id: user.github.id,
        username: user.github.username,
        name: user.github.name,
        avatarUrl: user.github.avatarUrl,
        profileUrl: user.github.profileUrl,
        connectedAt: user.github.connectedAt,
        followers: user.github.followers,
        following: user.github.following,
        publicRepos: user.github.publicRepos,
        publicGists: user.github.publicGists,
        organizations: user.github.organizations,
        pinnedRepositories: user.github.pinnedRepositories,
    };
};

const unlinkGitHub = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (!user.github || !user.github.id) {
        throw new AppError("GitHub account not connected", 400);
    }

    const deleteResult = await Repository.deleteMany({ owner: userId });

    user.github = undefined;
    await user.save();

    return {
        repositoriesRemoved: deleteResult.deletedCount || 0,
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
    syncGitHubRepositories,
    getRepositories,
    getRepositoryById,
    getRepositoryAnalytics,
    getGitHubDashboard,
    enhanceRepository,
    syncGitHubProfile,
    unlinkGitHub,
};