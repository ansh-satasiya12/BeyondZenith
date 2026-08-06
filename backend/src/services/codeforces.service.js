const AppError = require('../utils/AppError');
const User = require('../models/user.model');
const Submission = require('../models/submission.model');
const Contest = require('../models/contest.model');

const fetchCodeforcesProfile = async (handle) => {
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result || data.result.length === 0) {
        throw new AppError('Codeforces handle not found', 404);
    }

    const profile = data.result[0];

    return {
        handle: profile.handle,
        rating: profile.rating || 0,
        maxRating: profile.maxRating || 0,
        rank: profile.rank || null,
        maxRank: profile.maxRank || null,
        avatar: profile.avatar || null,
        organization: profile.organization || null,
    };
};

const connectCodeforces = async (userId, profile) => {
    const existingLink = await User.findOne({
        'codeforces.handle': profile.handle,
        _id: { $ne: userId },
    });

    if (existingLink) {
        throw new AppError('This Codeforces handle is already linked to another account', 409);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    user.codeforces = {
        ...profile,
        connectedAt: new Date(),
    };

    await user.save();

    return user;
};

const fetchCodeforcesSubmissions = async (handle) => {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await response.json();

    if (data.status !== 'OK') {
        throw new AppError(data.comment || 'Failed to fetch Codeforces submissions', 400);
    }

    return data.result;
};

const fetchCodeforcesContests = async (handle) => {
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = await response.json();

    if (data.status !== 'OK') {
        throw new AppError(data.comment || 'Failed to fetch Codeforces contest history', 400);
    }

    return data.result;
};

const normalizeLanguageName = (programmingLanguage) => {
    if (!programmingLanguage) {
        return null;
    }

    const lang = programmingLanguage.toLowerCase();

    if (lang.includes('c++')) return 'C++';
    if (lang.includes('pypy') || lang.includes('python')) return 'Python';
    if (lang.includes('javascript') || lang.includes('node')) return 'JavaScript';
    if (lang.includes('java')) return 'Java';
    if (lang.includes('kotlin')) return 'Kotlin';
    if (lang.includes('rust')) return 'Rust';
    if (lang.includes('c#') || lang.includes('csharp')) return 'C#';
    if (lang.includes('go')) return 'Go';
    if (lang.startsWith('gnu c') || lang === 'c') return 'C';

    return programmingLanguage;
};

const normalizeSubmissionData = (submission, userId) => {
    const problem = submission.problem || {};
    const contestId = submission.contestId ?? null;
    const problemId = `${contestId ?? 'NA'}${problem.index || ''}`;

    return {
        owner: userId,
        submissionId: submission.id,
        contestId,
        problemId,
        problemName: problem.name || null,
        rating: problem.rating ?? null,
        tags: Array.isArray(problem.tags) ? problem.tags : [],
        language: normalizeLanguageName(submission.programmingLanguage),
        verdict: submission.verdict || null,
        programmingLanguage: submission.programmingLanguage || null,
        creationTime: submission.creationTimeSeconds
            ? new Date(submission.creationTimeSeconds * 1000)
            : new Date(),
        passedTestCount: submission.passedTestCount ?? 0,
        timeConsumedMillis: submission.timeConsumedMillis ?? 0,
        memoryConsumedBytes: submission.memoryConsumedBytes ?? 0,
    };
};

const normalizeContestData = (contest, userId) => {
    const oldRating = contest.oldRating ?? 0;
    const newRating = contest.newRating ?? 0;

    return {
        owner: userId,
        contestId: contest.contestId,
        contestName: contest.contestName || null,
        rank: contest.rank ?? null,
        oldRating,
        newRating,
        ratingChange: newRating - oldRating,
        contestTime: contest.ratingUpdateTimeSeconds
            ? new Date(contest.ratingUpdateTimeSeconds * 1000)
            : new Date(),
    };
};

const bulkUpsertSubmissions = async (userId, submissions) => {
    if (submissions.length > 0) {
        const bulkOps = submissions.map((submissionData) => ({
            updateOne: {
                filter: { owner: userId, submissionId: submissionData.submissionId },
                update: { $set: submissionData },
                upsert: true,
            },
        }));

        await Submission.bulkWrite(bulkOps, { ordered: false });
    }

    const submissionIds = submissions.map((submission) => submission.submissionId);

    const deleteResult = await Submission.deleteMany({
        owner: userId,
        submissionId: { $nin: submissionIds },
    });

    return {
        totalSynced: submissions.length,
        deleted: deleteResult.deletedCount || 0,
    };
};

const bulkUpsertContests = async (userId, contests) => {
    if (contests.length > 0) {
        const bulkOps = contests.map((contestData) => ({
            updateOne: {
                filter: { owner: userId, contestId: contestData.contestId },
                update: { $set: contestData },
                upsert: true,
            },
        }));

        await Contest.bulkWrite(bulkOps, { ordered: false });
    }

    const contestIds = contests.map((contest) => contest.contestId);

    const deleteResult = await Contest.deleteMany({
        owner: userId,
        contestId: { $nin: contestIds },
    });

    return {
        totalSynced: contests.length,
        deleted: deleteResult.deletedCount || 0,
    };
};

const deriveContestProblemData = (rawSubmissions) => {
    const contestMap = new Map();

    rawSubmissions.forEach((submission) => {
        const problem = submission.problem || {};
        const contestId = submission.contestId;

        if (!contestId || !problem.index) {
            return;
        }

        if (!contestMap.has(contestId)) {
            contestMap.set(contestId, { solved: new Map(), attempted: new Map() });
        }

        const entry = contestMap.get(contestId);
        const problemEntry = { index: problem.index, name: problem.name || null };

        entry.attempted.set(problem.index, problemEntry);

        if (submission.verdict === 'OK') {
            entry.solved.set(problem.index, problemEntry);
        }
    });

    const result = new Map();
    contestMap.forEach((value, contestId) => {
        result.set(contestId, {
            solvedProblems: Array.from(value.solved.values()),
            attemptedProblems: Array.from(value.attempted.values()),
        });
    });

    return result;
};

const attachProblemsToContests = async (userId, contestProblemMap) => {
    if (contestProblemMap.size === 0) {
        return;
    }

    const bulkOps = Array.from(contestProblemMap.entries()).map(([contestId, data]) => ({
        updateOne: {
            filter: { owner: userId, contestId },
            update: {
                $set: {
                    solvedProblems: data.solvedProblems,
                    attemptedProblems: data.attemptedProblems,
                },
            },
        },
    }));

    await Contest.bulkWrite(bulkOps, { ordered: false });
};

const syncCodeforcesData = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const handle = user.codeforces?.handle;
    if (!handle) {
        throw new AppError('Codeforces account not connected', 400);
    }

    const [rawSubmissions, rawContests] = await Promise.all([
        fetchCodeforcesSubmissions(handle),
        fetchCodeforcesContests(handle),
    ]);

    const normalizedSubmissions = rawSubmissions.map((submission) => normalizeSubmissionData(submission, userId));
    const normalizedContests = rawContests.map((contest) => normalizeContestData(contest, userId));

    const submissionSyncResult = await bulkUpsertSubmissions(userId, normalizedSubmissions);
    const contestSyncResult = await bulkUpsertContests(userId, normalizedContests);

    const contestProblemData = deriveContestProblemData(rawSubmissions);
    await attachProblemsToContests(userId, contestProblemData);

    return {
        totalSubmissionsFetched: rawSubmissions.length,
        totalSubmissionsSynced: submissionSyncResult.totalSynced,
        totalContestsFetched: rawContests.length,
        totalContestsSynced: contestSyncResult.totalSynced,
    };
};

const VALID_SUBMISSION_SORT_FIELDS = ['creationTime', 'rating', 'verdict', 'language'];

const listSubmissions = async (userId, query = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'creationTime',
        order = 'desc',
        verdict,
        language,
        rating,
        contestId,
        tag,
        search,
    } = query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = { owner: userId };

    if (verdict) {
        filter.verdict = verdict.trim();
    }

    if (language) {
        filter.language = language.trim();
    }

    if (rating !== undefined) {
        const parsedRating = parseInt(rating, 10);
        if (!isNaN(parsedRating)) {
            filter.rating = parsedRating;
        }
    }

    if (contestId !== undefined) {
        const parsedContestId = parseInt(contestId, 10);
        if (!isNaN(parsedContestId)) {
            filter.contestId = parsedContestId;
        }
    }

    if (tag) {
        filter.tags = { $in: [tag.trim()] };
    }

    if (search) {
        filter.problemName = { $regex: search.trim(), $options: 'i' };
    }

    const sortField = VALID_SUBMISSION_SORT_FIELDS.includes(sortBy) ? sortBy : 'creationTime';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [submissions, totalItems] = await Promise.all([
        Submission.find(filter).sort(sort).skip(skip).limit(parsedLimit).lean(),
        Submission.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return {
        submissions,
        pagination: {
            page: parsedPage,
            limit: parsedLimit,
            totalItems,
            totalPages,
        },
    };
};

const getSubmission = async (userId, submissionId) => {
    const submission = await Submission.findOne({
        _id: submissionId,
        owner: userId,
    }).lean();

    if (!submission) {
        throw new AppError('Submission not found', 404);
    }

    return submission;
};

const VALID_CONTEST_SORT_FIELDS = ['contestTime', 'ratingChange', 'rank'];

const listContests = async (userId, query = {}) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'contestTime',
        order = 'desc',
        ratingChange,
        contestId,
        search,
    } = query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = { owner: userId };

    if (ratingChange === 'positive') {
        filter.ratingChange = { $gt: 0 };
    } else if (ratingChange === 'negative') {
        filter.ratingChange = { $lt: 0 };
    }

    if (contestId !== undefined) {
        const parsedContestId = parseInt(contestId, 10);
        if (!isNaN(parsedContestId)) {
            filter.contestId = parsedContestId;
        }
    }

    if (search) {
        filter.contestName = { $regex: search.trim(), $options: 'i' };
    }

    const sortField = VALID_CONTEST_SORT_FIELDS.includes(sortBy) ? sortBy : 'contestTime';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const [contests, totalItems] = await Promise.all([
        Contest.find(filter).sort(sort).skip(skip).limit(parsedLimit).lean(),
        Contest.countDocuments(filter),
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

const getContest = async (userId, contestId) => {
    const contest = await Contest.findOne({
        _id: contestId,
        owner: userId,
    }).lean();

    if (!contest) {
        throw new AppError('Contest not found', 404);
    }

    return contest;
};

const getCodeforcesProfileSummary = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return {
        currentRating: user.codeforces?.rating || 0,
        maxRating: user.codeforces?.maxRating || 0,
        rank: user.codeforces?.rank || null,
        maxRank: user.codeforces?.maxRank || null,
    };
};

const getSubmissionAnalytics = async (userId) => {
    const ownerObjectId = new (require('mongoose').Types.ObjectId)(userId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [result] = await Submission.aggregate([
        { $match: { owner: ownerObjectId } },
        {
            $facet: {
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalSubmissions: { $sum: 1 },
                        },
                    },
                ],
                totalSolved: [
                    { $match: { verdict: 'OK' } },
                    { $group: { _id: '$problemId' } },
                    { $count: 'totalSolved' },
                ],
                verdictDistribution: [
                    { $match: { verdict: { $ne: null } } },
                    { $group: { _id: '$verdict', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $project: { _id: 0, verdict: '$_id', count: 1 } },
                ],
                languageDistribution: [
                    { $match: { language: { $ne: null } } },
                    { $group: { _id: '$language', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $project: { _id: 0, language: '$_id', count: 1 } },
                ],
                problemsSolvedByRating: [
                    { $match: { verdict: 'OK' } },
                    { $group: { _id: '$problemId', rating: { $first: '$rating' } } },
                    { $match: { rating: { $ne: null } } },
                    { $group: { _id: '$rating', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, rating: '$_id', count: 1 } },
                ],
                topProblemTags: [
                    { $match: { verdict: 'OK' } },
                    { $group: { _id: '$problemId', tags: { $first: '$tags' } } },
                    { $unwind: '$tags' },
                    { $group: { _id: '$tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                    { $project: { _id: 0, tag: '$_id', count: 1 } },
                ],
                recentActivity: [
                    { $match: { creationTime: { $gte: thirtyDaysAgo } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$creationTime' } },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, date: '$_id', count: 1 } },
                ],
            },
        },
    ]);

    const summaryDoc = result.summary[0] || {};
    const totalSolvedDoc = result.totalSolved[0] || {};

    return {
        totalSubmissions: summaryDoc.totalSubmissions || 0,
        totalSolved: totalSolvedDoc.totalSolved || 0,
        verdictDistribution: result.verdictDistribution,
        languageDistribution: result.languageDistribution,
        problemsSolvedByRating: result.problemsSolvedByRating,
        topProblemTags: result.topProblemTags,
        recentActivity: result.recentActivity,
    };
};

const getContestAnalytics = async (userId) => {
    const ownerObjectId = new (require('mongoose').Types.ObjectId)(userId);

    const [result] = await Contest.aggregate([
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
                            maxRating: { $max: '$newRating' },
                            highestRatingChange: { $max: '$ratingChange' },
                            lowestRatingChange: { $min: '$ratingChange' },
                        },
                    },
                ],
                latestContest: [
                    { $sort: { contestTime: -1 } },
                    { $limit: 1 },
                    { $project: { _id: 0, currentRating: '$newRating' } },
                ],
                ratingHistory: [
                    { $sort: { contestTime: 1 } },
                    { $project: { _id: 0, contestTime: 1, oldRating: 1, newRating: 1 } },
                ],
                solvedProblemsPerContest: [
                    { $sort: { contestTime: 1 } },
                    {
                        $project: {
                            _id: 0,
                            contestId: 1,
                            contestName: 1,
                            contestTime: 1,
                            solvedCount: { $size: '$solvedProblems' },
                        },
                    },
                ],
                participationTimeline: [
                    { $sort: { contestTime: 1 } },
                    { $project: { _id: 0, contestId: 1, contestName: 1, contestTime: 1 } },
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
        currentRating: latestDoc.currentRating ?? 0,
        maxRating: summaryDoc.maxRating || 0,
        highestRatingChange: summaryDoc.highestRatingChange ?? 0,
        lowestRatingChange: summaryDoc.lowestRatingChange ?? 0,
        ratingHistory: result.ratingHistory,
        solvedProblemsPerContest: result.solvedProblemsPerContest,
        participationTimeline: result.participationTimeline,
    };
};

const getCodeforcesAnalytics = async (userId) => {
    const [profile, submissions, contests] = await Promise.all([
        getCodeforcesProfileSummary(userId),
        getSubmissionAnalytics(userId),
        getContestAnalytics(userId),
    ]);

    return {
        profile,
        submissions,
        contests,
    };
};

const getRecentSubmissions = async (userId) => {
    return Submission.find({ owner: userId })
        .sort({ creationTime: -1 })
        .limit(10)
        .lean();
};

const getRecentContests = async (userId) => {
    const contests = await Contest.find({ owner: userId })
        .sort({ contestTime: -1 })
        .limit(5)
        .lean();

    return contests.map((contest) => ({
        contestName: contest.contestName,
        rank: contest.rank,
        ratingChange: contest.ratingChange,
        contestTime: contest.contestTime,
        solvedCount: (contest.solvedProblems || []).length,
    }));
};

const getCodeforcesDashboard = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const [analytics, recentSubmissions, recentContests] = await Promise.all([
        getCodeforcesAnalytics(userId),
        getRecentSubmissions(userId),
        getRecentContests(userId),
    ]);

    const profile = {
        handle: user.codeforces?.handle || null,
        avatar: user.codeforces?.avatar || null,
        rank: analytics.profile.rank,
        maxRank: analytics.profile.maxRank,
        currentRating: analytics.profile.currentRating,
        maxRating: analytics.profile.maxRating,
        organization: user.codeforces?.organization || null,
        connectedAt: user.codeforces?.connectedAt || null,
    };

    const overview = {
        totalSolved: analytics.submissions.totalSolved,
        totalSubmissions: analytics.submissions.totalSubmissions,
        totalContests: analytics.contests.totalContests,
        currentRating: analytics.profile.currentRating,
        maxRating: analytics.profile.maxRating,
        bestRank: analytics.contests.bestRank,
    };

    const analyticsSummary = {
        verdictDistribution: analytics.submissions.verdictDistribution,
        topLanguages: analytics.submissions.languageDistribution,
        topTags: analytics.submissions.topProblemTags,
        ratingHistory: analytics.contests.ratingHistory,
        activityTrend: analytics.submissions.recentActivity,
        solvedByRating: analytics.submissions.problemsSolvedByRating,
    };

    return {
        profile,
        overview,
        recentSubmissions,
        recentContests,
        analyticsSummary,
    };
};

const unlinkCodeforces = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.codeforces || !user.codeforces.handle) {
        throw new AppError('Codeforces account not connected', 400);
    }

    const [submissionDeleteResult, contestDeleteResult] = await Promise.all([
        Submission.deleteMany({ owner: userId }),
        Contest.deleteMany({ owner: userId }),
    ]);

    user.codeforces = undefined;
    await user.save();

    return {
        submissionsRemoved: submissionDeleteResult.deletedCount || 0,
        contestsRemoved: contestDeleteResult.deletedCount || 0,
    };
};

module.exports = {
    fetchCodeforcesProfile,
    connectCodeforces,
    fetchCodeforcesSubmissions,
    fetchCodeforcesContests,
    normalizeSubmissionData,
    normalizeContestData,
    bulkUpsertSubmissions,
    bulkUpsertContests,
    deriveContestProblemData,
    attachProblemsToContests,
    syncCodeforcesData,
    listSubmissions,
    getSubmission,
    listContests,
    getContest,
    getCodeforcesProfileSummary,
    getSubmissionAnalytics,
    getContestAnalytics,
    getCodeforcesAnalytics,
    getRecentSubmissions,
    getRecentContests,
    getCodeforcesDashboard,
    unlinkCodeforces,
};