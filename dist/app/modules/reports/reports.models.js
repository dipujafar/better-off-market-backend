"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reportsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
reportsSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
reportsSchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
reportsSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
const Reports = (0, mongoose_1.model)('Reports', reportsSchema);
exports.default = Reports;
