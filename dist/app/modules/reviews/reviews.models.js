"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
reviewsSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
reviewsSchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
reviewsSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
const Reviews = (0, mongoose_1.model)('Reviews', reviewsSchema);
exports.default = Reviews;
