import { z } from 'zod';
const createReportValidationSchema =
    z.object({
        body: z.object({
            seller: z.string({ required_error: 'seller is required' }),
            subject: z.string({ required_error: 'subject is required' }),
            description: z.string({ required_error: 'description is required' }),
        })
    })


export const reportValidation = {
    createReportValidationSchema
}