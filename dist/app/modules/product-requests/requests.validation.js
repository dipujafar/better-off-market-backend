"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestValidation = exports.updateRequestSchema = exports.reSendQuotationSchema = exports.requestSchema = void 0;
const zod_1 = require("zod");
exports.requestSchema = zod_1.z.object({
    body: zod_1.z.object({
        productLink: zod_1.z
            .string({ required_error: 'Product link is required' })
            .url('Product link must be a valid URL'),
    }),
});
exports.reSendQuotationSchema = zod_1.z.object({
    body: zod_1.z.object({
        productLink: zod_1.z.string().url('Product link must be a valid URL').optional(),
        title: zod_1.z
            .string({ required_error: 'Product title is required' })
            .min(1, 'Product title is required'),
        price: zod_1.z
            .number({
            required_error: 'Product price is required',
            invalid_type_error: 'Product price must be a number',
        })
            .positive('Product price must be greater than 0'),
        size: zod_1.z.string().min(1, 'Size is required').optional(),
        color: zod_1.z.string().min(1, 'Color is required').optional(),
        quantity: zod_1.z
            .number({
            required_error: 'Quantity is required',
            invalid_type_error: 'Quantity must be a number',
        })
            .int('Quantity must be an integer')
            .positive('Quantity must be greater than 0'),
    }),
});
exports.updateRequestSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        productLink: zod_1.z
            .string()
            .url('Product link must be a valid URL')
            .optional(),
        title: zod_1.z.string().min(1, 'Product title is required').optional(),
        price: zod_1.z
            .number()
            .positive('Product price must be greater than 0')
            .optional(),
        couponCode: zod_1.z.string().optional(),
        size: zod_1.z.string().min(1, 'Size is required').optional(),
        color: zod_1.z.string().min(1, 'Color is required').optional(),
        quantity: zod_1.z
            .number()
            .int()
            .positive('Quantity must be greater than 0')
            .optional(),
    })
        .partial(),
});
exports.requestValidation = {
    requestSchema: exports.requestSchema,
    updateRequestSchema: exports.updateRequestSchema,
    reSendQuotationSchema: exports.reSendQuotationSchema,
};
