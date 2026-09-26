"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteValidation = void 0;
const zod_1 = require("zod");
const guestValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        property: zod_1.z.string({ required_error: 'property is required' }),
    })
});
exports.favoriteValidation = {
    guestValidationSchema,
};
