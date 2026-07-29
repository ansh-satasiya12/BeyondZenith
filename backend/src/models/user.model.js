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
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
