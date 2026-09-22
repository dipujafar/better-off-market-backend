import { z } from 'zod';
const addAuthorizedSignerValidation = z.object({
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z.string({ required_error: 'email is required' }),
    }).array()
})

export const agreementValidation = {
    addAuthorizedSignerValidation
}