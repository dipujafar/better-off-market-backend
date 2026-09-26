import { z } from 'zod';

const addAuthorizedSignerValidation = z.object({
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z.string({ required_error: 'email is required' }),
    }).array()
})

const signAgreementValidation = z.object({

    body: z.object({
        email: z.string({ required_error: 'email is required' }).email('invalid email format'),
        signatureImage: z.string().optional(),
        signature: z.string().optional(),
    }).refine((data) => Boolean(data.signatureImage || data.signature), {
        message: 'signatureImage or signature is required',
        path: ['signatureImage'],
    }),
})

export const agreementValidation = {
    addAuthorizedSignerValidation,
    signAgreementValidation,
}