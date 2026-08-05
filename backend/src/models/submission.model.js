const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        submissionId: {
            type: Number,
            required: true,
        },
        contestId: {
            type: Number,
            default: null,
            index: true,
        },
        problemId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        problemName: {
            type: String,
            default: null,
            trim: true,
        },
        rating: {
            type: Number,
            default: null,
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        language: {
            type: String,
            default: null,
            trim: true,
        },
        verdict: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },
        programmingLanguage: {
            type: String,
            default: null,
            trim: true,
        },
        creationTime: {
            type: Date,
            required: true,
            index: true,
        },
        passedTestCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        timeConsumedMillis: {
            type: Number,
            default: 0,
            min: 0,
        },
        memoryConsumedBytes: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

submissionSchema.index({ owner: 1, submissionId: 1 }, { unique: true });
submissionSchema.index({ owner: 1, creationTime: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;