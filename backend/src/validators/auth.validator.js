const { z } = require('zod');

const registerSchema = z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string({ required_error: 'New password is required' }).min(8, 'New password must be at least 8 characters'),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
