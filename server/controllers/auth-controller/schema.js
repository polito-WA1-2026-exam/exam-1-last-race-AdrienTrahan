import z from 'zod';

export const registerUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export const loginUserSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});
