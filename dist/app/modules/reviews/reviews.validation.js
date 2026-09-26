"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidation = void 0;
const zod_1 = require("zod");
const createReviewValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        seller: zod_1.z.string({ required_error: 'seller is required' }),
        property: zod_1.z.string({ required_error: 'property is required' }),
        rating: zod_1.z.number({ required_error: 'rating is required' }),
        review: zod_1.z.string({ required_error: 'review is required' }),
    })
});
exports.reviewValidation = {
    createReviewValidationSchema
};
