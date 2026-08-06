"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyTransferCompanyValidation = void 0;
const zod_1 = require("zod");
/* =========================
   LOCATION SCHEMA
========================= */
const locationSchema = zod_1.z.object({
    type: zod_1.z.literal('Point'),
    coordinates: zod_1.z
        .array(zod_1.z.number())
        .length(2, 'Coordinates must contain [longitude, latitude]'),
});
/* =========================
   CREATE VALIDATION
   (ALL REQUIRED)
========================= */
const createMoneyTransferCompanyValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1, 'Name is required'),
        officeNumber: zod_1.z.string().trim().min(1, 'Office number is required'),
        address: zod_1.z.string().trim().min(1, 'Address is required'),
        location: locationSchema,
    }),
});
/* =========================
   UPDATE VALIDATION
   (ALL OPTIONAL)
========================= */
const updateMoneyTransferCompanyValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(1).optional(),
        officeNumber: zod_1.z.string().trim().min(1).optional(),
        address: zod_1.z.string().trim().min(1).optional(),
        location: locationSchema.optional(),
    }),
});
exports.MoneyTransferCompanyValidation = {
    createMoneyTransferCompanyValidationSchema,
    updateMoneyTransferCompanyValidationSchema,
};
