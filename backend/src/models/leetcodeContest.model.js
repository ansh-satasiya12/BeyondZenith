const mongoose = require('mongoose');

const leetcodeContestSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        contestSlug: {
            type: String,
            required: true,
            trim: true,
        },
        contestName: {
            type: String,
            default: null,
            trim: true,
        },
        contestTime: {
            type: Date,
            required: true,
            index: true,
        },
        rank: {
            type: Number,
            default: null,
        },
        rating: {
            type: Number,
            default: 0,
        },
        ratingChange: {
            type: Number,
            default: 0,
        },
        problemsSolved: {
            type: Number,
            default: 0,
        },
        totalProblems: {
            type: Number,
            default: 0,
        },
        finishTimeSeconds: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

leetcodeContestSchema.index({ owner: 1, contestSlug: 1 }, { unique: true });
leetcodeContestSchema.index({ owner: 1, contestTime: -1 });

const LeetCodeContest = mongoose.model('LeetCodeContest', leetcodeContestSchema);

module.exports = LeetCodeContest;