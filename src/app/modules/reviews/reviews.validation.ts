import { z } from 'zod';
const createReviewValidationSchema =
    z.object({
        body: z.object({
            seller: z.string({ required_error: 'seller is required' }),
            property: z.string({ required_error: 'property is required' }),
            rating: z.number({ required_error: 'rating is required' }),
            review: z.string({ required_error: 'review is required' }),
        })
    })


export const reviewValidation = {
    createReviewValidationSchema
}