const AppError = require('../utils/AppError');
const User = require('../models/user.model');

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

module.exports = { fetchCodeforcesProfile, connectCodeforces };