const { z } = require('zod');

const connectLeetCodeSchema = z.object({
    username: z
        .string({ required_error: 'Username is required' })
        .trim()
        .min(1, 'Username is required')
        .max(50, 'Username must be at most 50 characters'),
});

module.exports = { connectLeetCodeSchema };