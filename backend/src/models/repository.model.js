const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        githubRepoId: {
            type: Number,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: null,
            trim: true,
        },
        language: {
            type: String,
            default: null,
            trim: true,
            index: true,
        },
        topics: {
            type: [String],
            default: [],
        },
        visibility: {
            type: String,
            enum: ['public', 'private', 'internal'],
            default: 'public',
            lowercase: true,
            trim: true,
        },
        stars: {
            type: Number,
            default: 0,
            min: 0,
        },
        forks: {
            type: Number,
            default: 0,
            min: 0,
        },
        watchers: {
            type: Number,
            default: 0,
            min: 0,
        },
        size: {
            type: Number,
            default: 0,
            min: 0,
        },
        defaultBranch: {
            type: String,
            default: 'main',
            trim: true,
        },
        createdAtGithub: {
            type: Date,
            required: true,
        },
        updatedAtGithub: {
            type: Date,
            index: true,
            required: true,
        },
        pushedAt: {
            type: Date,
            required: true,
        },
        htmlUrl: {
            type: String,
            default: null,
            trim: true,
            required: true,
        },
        isFork: {
            type: Boolean,
            default: false,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        languageBreakdown: {
            type: Map,
            of: Number,
            default: {},
        },

        readme: {
            type: String,
            default: null,
        },

        latestCommitSha: {
            type: String,
            default: null,
            trim: true,
        },

        latestCommitUrl: {
            type: String,
            default: null,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient querying, sorting, and bulk upsert operations
repositorySchema.index({ owner: 1, githubRepoId: 1 }, { unique: true });
repositorySchema.index({ owner: 1, updatedAt: -1 });
repositorySchema.index({ owner: 1, language: 1 });

const Repository = mongoose.model('Repository', repositorySchema);

module.exports = Repository;
