"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsValidation = void 0;
const zod_1 = require("zod");
const createFaqsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string({ required_error: 'Question is required' }),
        answer: zod_1.z.string({ required_error: 'Answer is required' }),
    }),
});
const updateFaqsValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        question: zod_1.z.string({ required_error: 'Question is required' }).optional(),
        answer: zod_1.z.string({ required_error: 'Answer is required' }).optional(),
    }),
});
exports.faqsValidation = {
    createFaqsValidationSchema,
    updateFaqsValidationSchema,
};
