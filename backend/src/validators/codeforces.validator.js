const { z } = require('zod');

const connectCodeforcesSchema = z.object({
    handle: z
        .string({ required_error: 'Handle is required' })
        .trim()
        .min(3, 'Handle must be at least 3 characters')
        .max(24, 'Handle must be at most 24 characters'),
});

module.exports = { connectCodeforcesSchema };