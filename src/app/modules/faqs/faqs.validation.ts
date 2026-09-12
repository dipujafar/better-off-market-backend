import { z } from 'zod';
const createFaqsValidationSchema = z.object({
    body: z.object({
        question: z.string({ required_error: 'Question is required' }),
        answer: z.string({ required_error: 'Answer is required' }),
    }),
});

const updateFaqsValidationSchema = z.object({
    body: z.object({
        question: z.string({ required_error: 'Question is required' }).optional(),
        answer: z.string({ required_error: 'Answer is required' }).optional(),
    }),
});

export const faqsValidation = {
    createFaqsValidationSchema,
    updateFaqsValidationSchema,
};