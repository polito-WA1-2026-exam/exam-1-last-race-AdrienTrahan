import z from 'zod';

export const gameLaunchSchema = z.object({
    gameId: z.number().int().min(0),
});

export const gameSubmitAnswerSchema = z.object({
    gameId: z.number().int().min(0),
    answer: z.array(z.number().int().min(0)),
});
