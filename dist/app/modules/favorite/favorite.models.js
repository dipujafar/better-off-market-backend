"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const favoriteSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
favoriteSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
favoriteSchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
favoriteSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
const Favorite = (0, mongoose_1.model)('Favorite', favoriteSchema);
exports.default = Favorite;
