const AppError = require('../utils/AppError');
const User = require('../models/user.model');
const LeetCodeProfile = require('../models/leetcodeProfile.model');
const LeetCodeContest = require('../models/leetcodeContest.model');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

const executeLeetCodeQuery = async (query, variables) => {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Referer: 'https://leetcode.com',
        },
        body: JSON.stringify({ query, variables }),
    });

    return response.json();
};

const fetchLeetCodeProfile = async (username) => {
    const query = `
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    userAvatar
                    ranking
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        throw new AppError('LeetCode username not found', 404);
    }

    const matchedUser = data.data.matchedUser;
    const profile = matchedUser.profile || {};

    return {
        username: matchedUser.username,
        name: profile.realName || null,
        avatarUrl: profile.userAvatar || null,
        ranking: profile.ranking || 0,
    };
};

const connectLeetCode = async (userId, profile) => {
    const existingLink = await User.findOne({
        'leetcode.username': profile.username,
        _id: { $ne: userId },
    });

    if (existingLink) {
        throw new AppError('This LeetCode username is already linked to another account', 409);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.leetcode = {
        ...profile,
        connectedAt: new Date(),
    };

    await user.save();

    return user;
};

const fetchLeetCodeStats = async (username) => {
    const query = `
        query getUserStats($username: String!) {
            matchedUser(username: $username) {
                profile {
                    ranking
                    reputation
                }
                submitStats: submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        throw new AppError('Failed to fetch LeetCode stats', 400);
    }

    return data.data.matchedUser;
};

const fetchLeetCodeContestHistory = async (username) => {
    const query = `
        query userContestRankingInfo($username: String!) {
            userContestRankingHistory(username: $username) {
                attended
                trendDirection
                problemsSolved
                totalProblems
                finishTimeInSeconds
                rating
                ranking
                contest {
                    title
                    titleSlug
                    startTime
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data) {
        throw new AppError('Failed to fetch LeetCode contest history', 400);
    }

    return data.data.userContestRankingHistory || [];
};

const fetchLeetCodeCalendar = async (username) => {
    const query = `
        query userProfileCalendar($username: String!) {
            matchedUser(username: $username) {
                submissionCalendar
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        throw new AppError('Failed to fetch LeetCode submission calendar', 400);
    }

    const rawCalendar = data.data.matchedUser.submissionCalendar;

    return rawCalendar ? JSON.parse(rawCalendar) : {};
};

const fetchLeetCodeLanguageStats = async (username) => {
    const query = `
        query languageStats($username: String!) {
            matchedUser(username: $username) {
                languageProblemCount {
                    languageName
                    problemsSolved
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        throw new AppError('Failed to fetch LeetCode language stats', 400);
    }

    return data.data.matchedUser.languageProblemCount || [];
};

const fetchLeetCodeSkillStats = async (username) => {
    const query = `
        query skillStats($username: String!) {
            matchedUser(username: $username) {
                tagProblemCounts {
                    advanced {
                        tagName
                        problemsSolved
                    }
                    intermediate {
                        tagName
                        problemsSolved
                    }
                    fundamental {
                        tagName
                        problemsSolved
                    }
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        throw new AppError('Failed to fetch LeetCode skill stats', 400);
    }

    return data.data.matchedUser.tagProblemCounts || {};
};

const fetchLeetCodeBadges = async (username) => {
    const query = `
        query userBadges($username: String!) {
            matchedUser(username: $username) {
                badges {
                    id
                    displayName
                    icon
                }
            }
        }
    `;

    const data = await executeLeetCodeQuery(query, { username });

    if (!data.data || !data.data.matchedUser) {
        return [];
    }

    return data.data.matchedUser.badges || [];
};

const findByDifficulty = (list, difficulty) => {
    const entry = (list || []).find((item) => item.difficulty === difficulty);
    return entry ? entry.count : 0;
};

const normalizeLeetCodeProfileSnapshot = (stats, calendar, languageStats, skillStats, badges) => {
    const profile = stats.profile || {};
    const submitStats = stats.submitStats || {};

    const acSubmissions = submitStats.acSubmissionNum || [];
    const totalSubmissions = submitStats.totalSubmissionNum || [];

    const totalAccepted = findByDifficulty(acSubmissions, 'All');
    const totalSubmitted = findByDifficulty(totalSubmissions, 'All');

    const flatSkillStats = ['fundamental', 'intermediate', 'advanced'].flatMap((tier) =>
        (skillStats[tier] || []).map((tag) => ({
            tag: tag.tagName,
            tier,
            problemsSolved: tag.problemsSolved,
        }))
    );

    return {
        ranking: profile.ranking || 0,
        reputation: profile.reputation || 0,
        totalSolved: totalAccepted,
        easySolved: findByDifficulty(acSubmissions, 'Easy'),
        mediumSolved: findByDifficulty(acSubmissions, 'Medium'),
        hardSolved: findByDifficulty(acSubmissions, 'Hard'),
        acceptanceRate: totalSubmitted > 0 ? Math.round((totalAccepted / totalSubmitted) * 10000) / 100 : 0,
        submissionCalendar: calendar,
        languageStats: (languageStats || []).map((lang) => ({
            language: lang.languageName,
            problemsSolved: lang.problemsSolved,
        })),
        skillStats: flatSkillStats,
        badges: (badges || []).map((badge) => ({
            id: badge.id,
            name: badge.displayName,
            icon: badge.icon,
        })),
        lastSyncedAt: new Date(),
    };
};

const normalizeContestHistory = (rawHistory) => {
    const attended = (rawHistory || []).filter((entry) => entry.attended && entry.contest);
    const sorted = [...attended].sort((a, b) => a.contest.startTime - b.contest.startTime);

    return sorted.map((entry, index) => {
        const ratingChange = index === 0 ? 0 : entry.rating - sorted[index - 1].rating;

        return {
            contestSlug: entry.contest.titleSlug,
            contestName: entry.contest.title || null,
            contestTime: new Date(entry.contest.startTime * 1000),
            rank: entry.ranking ?? null,
            rating: entry.rating ?? 0,
            ratingChange,
            problemsSolved: entry.problemsSolved ?? 0,
            totalProblems: entry.totalProblems ?? 0,
            finishTimeSeconds: entry.finishTimeInSeconds ?? 0,
        };
    });
};

const upsertLeetCodeProfileSnapshot = async (userId, username, snapshotData) => {
    const profile = await LeetCodeProfile.findOneAndUpdate(
        { owner: userId },
        { $set: { owner: userId, username, ...snapshotData } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return profile;
};

const bulkUpsertLeetCodeContests = async (userId, contests) => {
    if (contests.length > 0) {
        const bulkOps = contests.map((contestData) => ({
            updateOne: {
                filter: { owner: userId, contestSlug: contestData.contestSlug },
                update: { $set: { owner: userId, ...contestData } },
                upsert: true,
            },
        }));

        await LeetCodeContest.bulkWrite(bulkOps, { ordered: false });
    }

    const contestSlugs = contests.map((contest) => contest.contestSlug);

    const deleteResult = await LeetCodeContest.deleteMany({
        owner: userId,
        contestSlug: { $nin: contestSlugs },
    });

    return {
        totalSynced: contests.length,
        deleted: deleteResult.deletedCount || 0,
    };
};

const syncLeetCodeData = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const username = user.leetcode?.username;
    if (!username) {
        throw new AppError('LeetCode account not connected', 400);
    }

    const [stats, rawContestHistory, calendar, languageStats, skillStats, badges] = await Promise.all([
        fetchLeetCodeStats(username),
        fetchLeetCodeContestHistory(username),
        fetchLeetCodeCalendar(username),
        fetchLeetCodeLanguageStats(username),
        fetchLeetCodeSkillStats(username),
        fetchLeetCodeBadges(username),
    ]);

    const snapshotData = normalizeLeetCodeProfileSnapshot(stats, calendar, languageStats, skillStats, badges);
    await upsertLeetCodeProfileSnapshot(userId, username, snapshotData);

    const normalizedContests = normalizeContestHistory(rawContestHistory);
    const contestSyncResult = await bulkUpsertLeetCodeContests(userId, normalizedContests);

    return {
        profileUpdated: true,
        statsUpdated: true,
        totalContestsFetched: normalizedContests.length,
        totalContestsSynced: contestSyncResult.totalSynced,
    };
};

const getLeetCodeProfile = async (userId) => {
    const profile = await LeetCodeProfile.findOne({ owner: userId }).lean();

    if (!profile) {
        throw new AppError('LeetCode profile not found — sync your account first', 404);
    }

    return profile;
};

const VALID_LEETCODE_CONTEST_SORT_FIELDS = ['contestTime', 'rating', 'rank', 'ratingChange'];

const listLeetCodeContests = async (userId, query = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'contestTime',
        order = 'desc',
        year,
        ratingChange,
        minRating,
        maxRating,
        search,
    } = query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = { owner: userId };

    if (year !== undefined) {
        const parsedYear = parseInt(year, 10);
        if (!isNaN(parsedYear)) {
            filter.contestTime = {
                $gte: new Date(Date.UTC(parsedYear, 0, 1)),
                $lt: new Date(Date.UTC(parsedYear + 1, 0, 1)),
            };
        }
    }

    if (ratingChange === 'positive') {
        filter.ratingChange = { $gt: 0 };
    } else if (ratingChange === 'negative') {
        filter.ratingChange = { $lt: 0 };
    }

    if (minRating !== undefined || maxRating !== undefined) {
        const ratingFilter = {};

        if (minRating !== undefined) {
            const parsedMin = parseInt(minRating, 10);
            if (!isNaN(parsedMin)) {
                ratingFilter.$gte = parsedMin;
            }
        }

        if (maxRating !== undefined) {
            const parsedMax = parseInt(maxRating, 10);
            if (!isNaN(parsedMax)) {
                ratingFilter.$lte = parsedMax;
            }
        }

        if (Object.keys(ratingFilter).length > 0) {
            filter.rating = ratingFilter;
        }
    }

    if (search) {
        filter.contestName = { $regex: search.trim(), $options: 'i' };
    }

    const sortField = VALID_LEETCODE_CONTEST_SORT_FIELDS.includes(sortBy) ? sortBy : 'contestTime';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [contests, totalItems] = await Promise.all([
        LeetCodeContest.find(filter).sort(sort).skip(skip).limit(parsedLimit).lean(),
        LeetCodeContest.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return {
        contests,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            totalItems,
            totalPages,
        },
    };
};

const getLeetCodeContest = async (userId, contestId) => {
    const contest = await LeetCodeContest.findOne({
        _id: contestId,
        owner: userId,
    }).lean();

    if (!contest) {
        throw new AppError('Contest not found', 404);
    }

    return contest;
};

const getLeetCodeContestAnalytics = async (userId) => {
    const ownerObjectId = new (require('mongoose').Types.ObjectId)(userId);

    const [result] = await LeetCodeContest.aggregate([
        { $match: { owner: ownerObjectId } },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalContests: { $sum: 1 },
                            bestRank: { $min: '$rank' },
                            averageRank: { $avg: '$rank' },
                            highestContestRating: { $max: '$rating' },
                            highestRatingChange: { $max: '$ratingChange' },
                            lowestRatingChange: { $min: '$ratingChange' },
                        },
                    },
                ],
                latestContest: [
                    { $sort: { contestTime: -1 } },
                    { $limit: 1 },
                    { $project: { _id: 0, currentContestRating: '$rating' } },
                ],
                ratingHistory: [
                    { $sort: { contestTime: 1 } },
                    { $project: { _id: 0, contestTime: 1, rating: 1 } },
                ],
                participationTimeline: [
                    { $sort: { contestTime: 1 } },
                    { $project: { _id: 0, contestSlug: 1, contestName: 1, contestTime: 1 } },
                ],
            },
        },
    ]);

    const summaryDoc = result.summary[0] || {};
    const latestDoc = result.latestContest[0] || {};

    return {
        totalContests: summaryDoc.totalContests || 0,
        bestRank: summaryDoc.bestRank ?? null,
        averageRank: summaryDoc.averageRank ? Math.round(summaryDoc.averageRank * 100) / 100 : null,
        currentContestRating: latestDoc.currentContestRating ?? 0,
        highestContestRating: summaryDoc.highestContestRating || 0,
        highestRatingChange: summaryDoc.highestRatingChange ?? 0,
        lowestRatingChange: summaryDoc.lowestRatingChange ?? 0,
        ratingHistory: result.ratingHistory,
        participationTimeline: result.participationTimeline,
    };
};

const buildLeetCodeProfileSection = (profileDoc) => {
    return {
        currentRanking: profileDoc.ranking || 0,
        reputation: profileDoc.reputation || 0,
        totalSolved: profileDoc.totalSolved || 0,
        easySolved: profileDoc.easySolved || 0,
        mediumSolved: profileDoc.mediumSolved || 0,
        hardSolved: profileDoc.hardSolved || 0,
        acceptanceRate: profileDoc.acceptanceRate || 0,
    };
};

const SECONDS_IN_A_DAY = 24 * 60 * 60;

const buildCalendarSummary = (calendar) => {
    const entries = Object.entries(calendar || {});

    if (entries.length === 0) {
        return {
            totalActiveDays: 0,
            totalCalendarSubmissions: 0,
            mostActiveDate: null,
            maxSubmissionsInADay: 0,
        };
    }

    let totalCalendarSubmissions = 0;
    let maxSubmissionsInADay = 0;
    let mostActiveTimestamp = null;

    entries.forEach(([timestamp, count]) => {
        totalCalendarSubmissions += count;
        if (count > maxSubmissionsInADay) {
            maxSubmissionsInADay = count;
            mostActiveTimestamp = timestamp;
        }
    });

    return {
        totalActiveDays: entries.length,
        totalCalendarSubmissions,
        mostActiveDate: mostActiveTimestamp
            ? new Date(parseInt(mostActiveTimestamp, 10) * 1000).toISOString().split('T')[0]
            : null,
        maxSubmissionsInADay,
    };
};

const buildRecentActivity = (calendar) => {
    const thirtyDaysAgoSeconds = Math.floor(Date.now() / 1000) - 30 * SECONDS_IN_A_DAY;

    return Object.entries(calendar || {})
        .filter(([timestamp]) => parseInt(timestamp, 10) >= thirtyDaysAgoSeconds)
        .map(([timestamp, count]) => ({
            date: new Date(parseInt(timestamp, 10) * 1000).toISOString().split('T')[0],
            count,
        }))
        .sort((a, b) => (a.date > b.date ? 1 : -1));
};

const buildLeetCodeProblemSolvingSection = (profileDoc) => {
    const solvedDistribution = [
        { difficulty: 'Easy', count: profileDoc.easySolved || 0 },
        { difficulty: 'Medium', count: profileDoc.mediumSolved || 0 },
        { difficulty: 'Hard', count: profileDoc.hardSolved || 0 },
    ];

    const languageDistribution = [...(profileDoc.languageStats || [])].sort(
        (a, b) => b.problemsSolved - a.problemsSolved
    );

    const skillDistribution = [...(profileDoc.skillStats || [])].sort(
        (a, b) => b.problemsSolved - a.problemsSolved
    );

    return {
        solvedDistribution,
        languageDistribution,
        skillDistribution,
        calendarSummary: buildCalendarSummary(profileDoc.submissionCalendar),
        recentActivity: buildRecentActivity(profileDoc.submissionCalendar),
    };
};

const getLeetCodeAnalytics = async (userId) => {
    const [profileDoc, contests] = await Promise.all([
        getLeetCodeProfile(userId),
        getLeetCodeContestAnalytics(userId),
    ]);

    return {
        profile: buildLeetCodeProfileSection(profileDoc),
        contests,
        problemSolving: buildLeetCodeProblemSolvingSection(profileDoc),
    };
};

const getRecentLeetCodeContests = async (userId) => {
    const contests = await LeetCodeContest.find({ owner: userId })
        .sort({ contestTime: -1 })
        .limit(10)
        .lean();

    return contests.map((contest) => ({
        contestName: contest.contestName,
        contestTime: contest.contestTime,
        rank: contest.rank,
        rating: contest.rating,
        ratingChange: contest.ratingChange,
        solvedCount: contest.problemsSolved,
    }));
};

const getLeetCodeDashboard = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.leetcode || !user.leetcode.username) {
        throw new AppError('LeetCode account not connected', 400);
    }

    const [analytics, recentContests] = await Promise.all([
        getLeetCodeAnalytics(userId),
        getRecentLeetCodeContests(userId),
    ]);

    return {
        profile: {
            username: user.leetcode.username || null,
            name: user.leetcode.name || null,
            avatarUrl: user.leetcode.avatarUrl || null,
            ranking: analytics.profile.currentRanking,
            reputation: analytics.profile.reputation,
            connectedAt: user.leetcode.connectedAt || null,
        },
        overview: {
            totalSolved: analytics.profile.totalSolved,
            easySolved: analytics.profile.easySolved,
            mediumSolved: analytics.profile.mediumSolved,
            hardSolved: analytics.profile.hardSolved,
            acceptanceRate: analytics.profile.acceptanceRate,
            totalContests: analytics.contests.totalContests,
            currentRating: analytics.contests.currentContestRating,
            maxRating: analytics.contests.highestContestRating,
        },
        contests: {
            recentContests,
            ratingHistory: analytics.contests.ratingHistory,
        },
        problemSolving: {
            solvedDistribution: analytics.problemSolving.solvedDistribution,
            languageDistribution: analytics.problemSolving.languageDistribution,
            skillDistribution: analytics.problemSolving.skillDistribution,
        },
        activity: {
            calendarSummary: analytics.problemSolving.calendarSummary,
            recentActivity: analytics.problemSolving.recentActivity,
        },
        analytics,
    };
};

const unlinkLeetCode = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.leetcode || !user.leetcode.username) {
        throw new AppError('LeetCode account not connected', 400);
    }

    const [profileDeleteResult, contestDeleteResult] = await Promise.all([
        LeetCodeProfile.deleteOne({ owner: userId }),
        LeetCodeContest.deleteMany({ owner: userId }),
    ]);

    user.leetcode = undefined;
    await user.save();

    return {
        profileRemoved: profileDeleteResult.deletedCount || 0,
        contestsRemoved: contestDeleteResult.deletedCount || 0,
    };
};

module.exports = {
    fetchLeetCodeProfile,
    connectLeetCode,
    fetchLeetCodeStats,
    fetchLeetCodeContestHistory,
    fetchLeetCodeCalendar,
    fetchLeetCodeLanguageStats,
    fetchLeetCodeSkillStats,
    fetchLeetCodeBadges,
    normalizeLeetCodeProfileSnapshot,
    normalizeContestHistory,
    upsertLeetCodeProfileSnapshot,
    bulkUpsertLeetCodeContests,
    syncLeetCodeData,
    getLeetCodeProfile,
    listLeetCodeContests,
    getLeetCodeContest,
    getLeetCodeContestAnalytics,
    buildLeetCodeProfileSection,
    buildLeetCodeProblemSolvingSection,
    getLeetCodeAnalytics,
    getRecentLeetCodeContests,
    getLeetCodeDashboard,
    unlinkLeetCode,
};