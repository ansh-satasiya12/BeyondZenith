const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        refreshToken: {
            type: String,
            default: null,
        },
        github: {
            id: String,
            username: String,
            name: String,
            avatarUrl: String,
            profileUrl: String,
            accessToken: String,
            connectedAt: Date,
            followers: {
                type: Number,
                default: 0,
            },

            following: {
                type: Number,
                default: 0,
            },

            publicRepos: {
                type: Number,
                default: 0,
            },

            publicGists: {
                type: Number,
                default: 0,
            },

            organizations: [
                {
                    id: String,
                    login: String,
                    avatarUrl: String,
                    url: String,
                },
            ],
            pinnedRepositories: [
                {
                    id: String,
                    name: String,
                    description: String,
                    stars: Number,
                    language: String,
                    htmlUrl: String,
                },
            ],
        },
        codeforces: {
            handle: String,
            rating: {
                type: Number,
                default: 0,
            },
            maxRating: {
                type: Number,
                default: 0,
            },
            rank: String,
            maxRank: String,
            avatar: String,
            organization: String,
            connectedAt: Date,
        },
        leetcode: {
            username: String,
            name: String,
            avatarUrl: String,
            ranking: {
                type: Number,
                default: 0,
            },
            connectedAt: Date,
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
