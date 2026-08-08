const AppError = require('../utils/AppError');
const User = require('../models/user.model');
const { getGitHubDashboard } = require('./github.service');
const { getCodeforcesDashboard } = require('./codeforces.service');
const { getLeetCodeDashboard } = require('./leetcode.service');

const safeFetchPlatformDashboard = async (platformName, isConnected, fetchFn) => {
    if (!isConnected) {
        return { connected: false, data: null };
    }

    try {
        const data = await fetchFn();
        return { connected: true, data };
    } catch (error) {
        console.error(`Unified dashboard: failed to load ${platformName} data — ${error.message}`);
        return { connected: true, data: null };
    }
};

const wrapPlatformSection = (result, shapeFn) => ({
    connected: result.connected,
    data: result.connected ? shapeFn(result.data) : null,
});

const shapeGitHubForProfile = (githubData) => {
    if (!githubData) return null;

    return {
        username: githubData.profile?.username || null,
        name: githubData.profile?.name || null,
        avatarUrl: githubData.profile?.avatarUrl || null,
        profileUrl: githubData.profile?.profileUrl || null,
        connectedAt: githubData.profile?.connectedAt || null,
    };
};

const shapeGitHubForOverview = (githubData) => {
    if (!githubData) return null;

    return {
        repositoryCount: githubData.summary?.total || 0,
        stars: githubData.metrics?.totalStars || 0,
        forks: githubData.metrics?.totalForks || 0,
        primaryLanguages: (githubData.languageDistribution || []).slice(0, 5),
    };
};

const shapeGitHubForActivity = (githubData) => {
    if (!githubData) return null;

    return {
        recentRepositories: githubData.recentRepositories || [],
    };
};

const shapeCodeforcesForProfile = (cfData) => {
    if (!cfData) return null;

    return {
        handle: cfData.profile?.handle || null,
        avatar: cfData.profile?.avatar || null,
        rank: cfData.profile?.rank || null,
        maxRank: cfData.profile?.maxRank || null,
        connectedAt: cfData.profile?.connectedAt || null,
    };
};

const shapeCodeforcesForOverview = (cfData) => {
    if (!cfData) return null;

    return {
        rating: cfData.profile?.currentRating || 0,
        maxRating: cfData.profile?.maxRating || 0,
        problemsSolved: cfData.overview?.totalSolved || 0,
        contestsParticipated: cfData.overview?.totalContests || 0,
        bestRank: cfData.overview?.bestRank ?? null,
    };
};

const shapeCodeforcesForActivity = (cfData) => {
    if (!cfData) return null;

    return {
        recentSubmissions: cfData.recentSubmissions || [],
        recentContests: cfData.recentContests || [],
    };
};

const shapeLeetCodeForProfile = (lcData) => {
    if (!lcData) return null;

    return {
        username: lcData.profile?.username || null,
        name: lcData.profile?.name || null,
        avatarUrl: lcData.profile?.avatarUrl || null,
        connectedAt: lcData.profile?.connectedAt || null,
    };
};

const shapeLeetCodeForOverview = (lcData) => {
    if (!lcData) return null;

    return {
        totalSolved: lcData.overview?.totalSolved || 0,
        easySolved: lcData.overview?.easySolved || 0,
        mediumSolved: lcData.overview?.mediumSolved || 0,
        hardSolved: lcData.overview?.hardSolved || 0,
        ranking: lcData.profile?.ranking || 0,
        contestRating: lcData.overview?.currentRating || 0,
        contestsParticipated: lcData.overview?.totalContests || 0,
    };
};

const shapeLeetCodeForActivity = (lcData) => {
    if (!lcData) return null;

    return {
        recentContests: lcData.contests?.recentContests || [],
        recentActivity: lcData.activity?.recentActivity || [],
    };
};

const buildHighlights = (overview) => {
    const totalProblemsSolved =
        (overview.codeforces.data?.problemsSolved || 0) + (overview.leetcode.data?.totalSolved || 0);

    const connectedPlatforms = ['github', 'codeforces', 'leetcode'].filter(
        (platform) => overview[platform].connected
    );

    return {
        totalProblemsSolved,
        totalRepositories: overview.github.data?.repositoryCount || 0,
        totalStars: overview.github.data?.stars || 0,
        topGithubLanguage: overview.github.data?.primaryLanguages?.[0]?.language || null,
        highestContestRating: Math.max(
            overview.codeforces.data?.rating || 0,
            overview.leetcode.data?.contestRating || 0
        ),
        connectedPlatforms,
        connectedPlatformCount: connectedPlatforms.length,
    };
};

const getUnifiedDashboard = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const isGitHubConnected = Boolean(user.github?.id);
    const isCodeforcesConnected = Boolean(user.codeforces?.handle);
    const isLeetCodeConnected = Boolean(user.leetcode?.username);

    const [githubResult, codeforcesResult, leetcodeResult] = await Promise.all([
        safeFetchPlatformDashboard('github', isGitHubConnected, () => getGitHubDashboard(userId)),
        safeFetchPlatformDashboard('codeforces', isCodeforcesConnected, () => getCodeforcesDashboard(userId)),
        safeFetchPlatformDashboard('leetcode', isLeetCodeConnected, () => getLeetCodeDashboard(userId)),
    ]);

    const profile = {
        user: {
            name: user.name || null,
            email: user.email || null,
            avatar: user.github?.avatarUrl || user.leetcode?.avatarUrl || user.codeforces?.avatar || null,
        },
        platforms: {
            github: wrapPlatformSection(githubResult, shapeGitHubForProfile),
            codeforces: wrapPlatformSection(codeforcesResult, shapeCodeforcesForProfile),
            leetcode: wrapPlatformSection(leetcodeResult, shapeLeetCodeForProfile),
        },
    };

    const overview = {
        github: wrapPlatformSection(githubResult, shapeGitHubForOverview),
        codeforces: wrapPlatformSection(codeforcesResult, shapeCodeforcesForOverview),
        leetcode: wrapPlatformSection(leetcodeResult, shapeLeetCodeForOverview),
    };

    const activity = {
        github: wrapPlatformSection(githubResult, shapeGitHubForActivity),
        codeforces: wrapPlatformSection(codeforcesResult, shapeCodeforcesForActivity),
        leetcode: wrapPlatformSection(leetcodeResult, shapeLeetCodeForActivity),
    };

    const highlights = buildHighlights(overview);

    return { profile, overview, activity, highlights };
};

module.exports = { getUnifiedDashboard };