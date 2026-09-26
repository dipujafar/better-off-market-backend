"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = void 0;
const mongoose_1 = require("mongoose");
const offer_constants_1 = require("./offer.constants");
const offerTermsFields = {
    offerAmount: { type: Number, required: true },
    earnestMoney: { type: Number, required: true },
    financingType: { type: String, enum: offer_constants_1.FINANCING_TYPES, required: true },
    otherFinancingType: { type: String, default: null },
    financingTerms: { type: String, default: null },
    closingCostOption: { type: String, enum: offer_constants_1.CLOSING_COST_OPTIONS, required: true },
    sellerContribution: { type: Number, default: null },
    inspectionContingency: { type: String, enum: offer_constants_1.YES_NO, required: true },
    inspectionDays: { type: Number, default: null },
    appraisalContingency: { type: String, enum: offer_constants_1.YES_NO, required: true },
    // appraisalDays: { type: Number, default: null },
    hasAgent: { type: String, enum: offer_constants_1.YES_NO, required: true },
    agentName: { type: String, default: null },
    brokerageName: { type: String, default: null },
    commission: { type: String, default: null },
    paidBy: { type: String, enum: offer_constants_1.PAID_BY, default: null },
    personalPropertyIncluded: { type: String, default: null },
    itemsToBeRemoved: { type: String, default: null },
    titleCompany: { type: String, default: null },
    closingDate: { type: String, default: null },
    possession: { type: String, enum: offer_constants_1.POSSESSION_OPTIONS, default: null },
    sellerPostClosingDays: { type: Number, default: null },
    additionalTerms: { type: String, default: null },
    notesToSeller: { type: String, default: null },
    notesToBuyer: { type: String, default: null },
};
const offerHistorySchema = new mongoose_1.Schema(Object.assign(Object.assign({}, offerTermsFields), { round: { type: Number, required: true }, madeBy: { type: String, enum: offer_constants_1.MADE_BY, required: true }, madeByUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, status: { type: String, enum: offer_constants_1.OFFER_STATUS_OPTIONS, default: offer_constants_1.OFFER_STATUS.pending, required: true } }), { _id: false, timestamps: { createdAt: true, updatedAt: false } });
const currentTermsSchema = new mongoose_1.Schema(offerTermsFields, { _id: false, timestamps: { createdAt: true, updatedAt: false } });
const offerSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    // offer accept part 
    offerAcceptedBy: { type: String, enum: offer_constants_1.MADE_BY, required: true },
    isBuyerAddedAuthorizedSigner: { type: Boolean, default: false },
    isSellerAddedAuthorizedSigner: { type: Boolean, default: false },
    status: {
        type: String,
        enum: offer_constants_1.OFFER_STATUS_OPTIONS,
        default: offer_constants_1.OFFER_STATUS.pending,
    },
    currentRound: { type: Number, default: 1 },
    lastActionBy: { type: String, enum: offer_constants_1.MADE_BY, required: true },
    currentTerms: { type: currentTermsSchema, required: true },
    history: { type: [offerHistorySchema], default: [] },
    supportingDocuments: {
        type: [
            {
                name: { type: String, required: true },
                size: { type: String, required: true },
                updated: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],
        default: [],
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
offerSchema.statics.IsOfferExistId = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.Offer.findById(id);
    });
};
offerSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
offerSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
    next();
});
exports.Offer = (0, mongoose_1.model)('Offer', offerSchema);
