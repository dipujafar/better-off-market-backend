"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryValidation = exports.updateCategorySchema = exports.createCategorySchema = exports.WebsiteLinkSchema = void 0;
const zod_1 = require("zod");
exports.WebsiteLinkSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    subTitle: zod_1.z
        .string()
        .min(1, 'SubTitle is required')
        .max(150, 'SubTitle must be less than 150 characters'),
    link: zod_1.z.string().url('Website link must be a valid URL'),
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, 'Name is required')
            .max(100, 'Name must be less than 100 characters'),
        description: zod_1.z
            .string()
            .min(1, 'Description is required')
            .max(500, 'Description must be less than 500 characters'),
        websiteLinks: zod_1.z
            .array(exports.WebsiteLinkSchema)
            .min(1, 'At least one website link is required'),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    body: exports.createCategorySchema.shape.body.deepPartial(),
});
exports.categoryValidation = {
    createCategorySchema: exports.createCategorySchema,
    updateCategorySchema: exports.updateCategorySchema,
};
