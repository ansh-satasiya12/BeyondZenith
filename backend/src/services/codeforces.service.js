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

module.exports = {
    fetchCodeforcesProfile,
    connectCodeforces,
    syncCodeforcesData,
};