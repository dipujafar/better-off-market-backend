import { z } from 'zod';
const guestValidationSchema = z.object({
    body: z.object({
        property: z.string({ required_error: 'property is required' }),
    })
});

export const favoriteValidation = {
    guestValidationSchema,
};