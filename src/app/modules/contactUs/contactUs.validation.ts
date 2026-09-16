import { z } from "zod"

const sendContactUsValidation = z.object({
    body: z.object({
        name: z.string({ required_error: 'name is required' }),
        email: z
            .string({ required_error: 'Email is required' })
            .email({ message: 'Invalid email address' }),
        subject: z.string({ required_error: 'subject is required' }),
        message: z.string({ required_error: 'message is required' }),
    })
});


export const contactUsValidation = {
    sendContactUsValidation,
}