"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInTouchValidation = void 0;
const zod_1 = require("zod");
const createGetInTouch = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        counties: zod_1.z.array(zod_1.z.string()).min(1, "Please select at least one county"),
        propertyTypes: zod_1.z
            .array(zod_1.z.string({ message: "Please select at least one property type" }))
            .min(1, "Please select at least one property type"),
    })
});
exports.getInTouchValidation = {
    createGetInTouch,
};
