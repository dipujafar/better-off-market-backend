"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const createInitPaymentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        productRequest: zod_1.z
            .string({
            required_error: 'Product request id is required',
        })
            .refine(id => mongoose_1.Types.ObjectId.isValid(id), {
            message: 'Invalid productRequest ObjectId',
        }),
        moneyTransferCompany: zod_1.z
            .string({
            required_error: 'Money transfer company id is required',
        })
            .refine(id => mongoose_1.Types.ObjectId.isValid(id), {
            message: 'Invalid moneyTransferCompany ObjectId',
        }),
    }),
});
const createSecondPaymentValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        order: zod_1.z
            .string({
            required_error: 'order is required',
        })
            .refine(id => mongoose_1.Types.ObjectId.isValid(id), {
            message: 'Invalid order ObjectId',
        }),
        moneyTransferCompany: zod_1.z
            .string({
            required_error: 'Money transfer company id is required',
        })
            .refine(id => mongoose_1.Types.ObjectId.isValid(id), {
            message: 'Invalid moneyTransferCompany ObjectId',
        }),
    }),
});
exports.paymentValidation = {
    createSecondPaymentValidationSchema,
    createInitPaymentValidationSchema,
};
