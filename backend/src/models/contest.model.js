const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        contestId: {
            type: Number,
            required: true,
            index: true,
        },
        contestName: {
            type: String,
            default: null,
            trim: true,
        },
        rank: {
            type: Number,
            default: null,
        },
        oldRating: {
            type: Number,
            default: 0,
        },
        newRating: {
            type: Number,
            default: 0,
        },
        ratingChange: {
            type: Number,
            default: 0,
        },
        contestTime: {
            type: Date,
            required: true,
            index: true,
        },
        solvedProblems: [
            {
                index: String,
                name: String,
            },
        ],
        attemptedProblems: [
            {
                index: String,
                name: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

contestSchema.index({ owner: 1, contestId: 1 }, { unique: true });
contestSchema.index({ owner: 1, contestTime: -1 });

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;