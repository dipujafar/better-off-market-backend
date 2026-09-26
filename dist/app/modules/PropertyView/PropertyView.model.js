"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyView = void 0;
const mongoose_1 = require("mongoose");
const propertyViewSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now },
});
// speeds up the weekly aggregation query in step 4
propertyViewSchema.index({ seller: 1, viewedAt: 1 });
exports.PropertyView = (0, mongoose_1.model)('PropertyView', propertyViewSchema);
