"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LocationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function (value) {
                return value.length === 2;
            },
            message: 'Coordinates must contain [longitude, latitude]',
        },
    },
}, {
    _id: false,
});
const moneyTransferCompanySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    officeNumber: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: LocationSchema,
        required: true,
    },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
moneyTransferCompanySchema.index({ location: '2dsphere' });
moneyTransferCompanySchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
moneyTransferCompanySchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
// moneyTransferCompanySchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { isDeleted: false } });
//   next();
// });
// In your schema/plugin file
moneyTransferCompanySchema.pre('aggregate', function () {
    const pipeline = this.pipeline();
    // ✅ Don't inject $match if $geoNear is already the first stage
    // @ts-ignore
    if (pipeline.length > 0 && pipeline[0].$geoNear)
        return;
    pipeline.unshift({ $match: { isDeleted: false } });
});
const MoneyTransferCompany = (0, mongoose_1.model)('MoneyTransferCompany', moneyTransferCompanySchema);
exports.default = MoneyTransferCompany;
