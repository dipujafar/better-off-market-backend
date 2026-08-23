import { z } from 'zod';
const createGetInTouch = z.object({
    body: z.object({
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        counties: z.array(z.string()).min(1, "Please select at least one county"),
        propertyTypes: z
            .array(z.string({ message: "Please select at least one property type" }))
            .min(1, "Please select at least one property type"),
    })
});

export const getInTouchValidation = {
    createGetInTouch,
}