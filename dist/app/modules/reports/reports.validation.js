"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportValidation = void 0;
const zod_1 = require("zod");
const createReportValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        seller: zod_1.z.string({ required_error: 'seller is required' }),
        subject: zod_1.z.string({ required_error: 'subject is required' }),
        description: zod_1.z.string({ required_error: 'description is required' }),
    })
});
exports.reportValidation = {
    createReportValidationSchema
};
