"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUsValidation = void 0;
const zod_1 = require("zod");
const sendContactUsValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'name is required' }),
        email: zod_1.z
            .string({ required_error: 'Email is required' })
            .email({ message: 'Invalid email address' }),
        subject: zod_1.z.string({ required_error: 'subject is required' }),
        message: zod_1.z.string({ required_error: 'message is required' }),
    })
});
exports.contactUsValidation = {
    sendContactUsValidation,
};
