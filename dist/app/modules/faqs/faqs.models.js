"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const faqsSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
faqsSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
faqsSchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
faqsSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
const Faqs = (0, mongoose_1.model)('Faqs', faqsSchema);
exports.default = Faqs;
