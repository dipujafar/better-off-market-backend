"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agreementValidation = void 0;
const zod_1 = require("zod");
const addAuthorizedSignerValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'name is required' }),
        email: zod_1.z.string({ required_error: 'email is required' }),
    }).array()
});
const signAgreementValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'offer id is required' }),
    }),
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'email is required' }).email('invalid email format'),
        signatureImage: zod_1.z.string().optional(),
        signature: zod_1.z.string().optional(),
    }).refine((data) => Boolean(data.signatureImage || data.signature), {
        message: 'signatureImage or signature is required',
        path: ['signatureImage'],
    }),
});
exports.agreementValidation = {
    addAuthorizedSignerValidation,
    signAgreementValidation,
};
