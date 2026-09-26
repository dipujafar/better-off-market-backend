"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agreement = void 0;
const mongoose_1 = require("mongoose");
const agreement_constants_1 = require("./agreement.constants");
const authorizeSigner = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    isSigned: { type: Boolean, default: false },
    signatureImage: { type: String, default: null },
    signedAt: { type: Date, default: null },
});
const agreementSchema = new mongoose_1.Schema({
    offer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Offer', required: true, unique: true },
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: agreement_constants_1.AGREEMENT_STATUS_OPTIONS,
        default: agreement_constants_1.AGREEMENT_STATUS.processing,
        required: true,
    },
    agreementMainDoc: { type: String, default: null },
    buyerAuthorizeSigner: { type: [authorizeSigner], default: [] },
    sellerAuthorizeSigner: { type: [authorizeSigner], default: [] },
    isDeleted: { type: 'boolean', default: false },
}, { timestamps: true });
exports.Agreement = (0, mongoose_1.model)('Agreement', agreementSchema);
