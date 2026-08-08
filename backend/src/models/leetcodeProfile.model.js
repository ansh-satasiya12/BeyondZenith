const mongoose = require('mongoose');

const leetcodeProfileSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        ranking: {
            type: Number,
            default: 0,
        },
        reputation: {
            type: Number,
            default: 0,
        },
        totalSolved: {
            type: Number,
            default: 0,
        },
        easySolved: {
            type: Number,
            default: 0,
        },
        mediumSolved: {
            type: Number,
            default: 0,
        },
        hardSolved: {
            type: Number,
            default: 0,
        },
        acceptanceRate: {
            type: Number,
            default: 0,
        },
        submissionCalendar: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        languageStats: [
            {
                language: String,
                problemsSolved: Number,
            },
        ],
        skillStats: [
            {
                tag: String,
                tier: String,
                problemsSolved: Number,
            },
        ],
        badges: [
            {
                id: String,
                name: String,
                icon: String,
            },
        ],
        lastSyncedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const LeetCodeProfile = mongoose.model('LeetCodeProfile', leetcodeProfileSchema);

module.exports = LeetCodeProfile;