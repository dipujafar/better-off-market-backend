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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agreementService = exports.getAgreementByOfferId = exports.getAgreements = exports.signAgreement = exports.addBuyerAuthorizedSigner = exports.addSellerAuthorizedSigner = void 0;
const offer_models_1 = require("../offer/offer.models");
const agreement_model_1 = require("./agreement.model");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const mailSender_1 = require("../../utils/mailSender");
const config_1 = __importDefault(require("../../config"));
const properties_utils_1 = require("../properties/properties.utils");
const AppError_1 = __importDefault(require("../../error/AppError"));
const properties_models_1 = require("../properties/properties.models");
const properties_constants_1 = require("../properties/properties.constants");
const agreement_constants_1 = require("./agreement.constants");
const agreement_utils_1 = require("./agreement.utils");
const findSignerIndexByEmail = (signers = [], email) => {
    const normalizedEmail = String(email !== null && email !== void 0 ? email : '').trim().toLowerCase();
    return signers.findIndex((signer) => { var _a; return String((_a = signer.email) !== null && _a !== void 0 ? _a : '').trim().toLowerCase() === normalizedEmail; });
};
const addSellerAuthorizedSigner = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { $set: { isSellerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');
    const result = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { $push: { sellerAuthorizeSigner: payload } }, { new: true });
    const contactEmailPath = path_1.default.join(__dirname, '../../../../public/view/agreement.html');
    const seller = offer === null || offer === void 0 ? void 0 : offer.seller;
    const property = offer === null || offer === void 0 ? void 0 : offer.property;
    payload.forEach((signer) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mailSender_1.sendEmail)(signer.email, 'You have been added as an authorized signer for a property agreement', fs_1.default
            .readFileSync(contactEmailPath, 'utf8')
            .replace('{{userName}}', signer.name)
            .replace('{{name}}', seller === null || seller === void 0 ? void 0 : seller.name)
            .replace('{{propertyAddress}}', (0, properties_utils_1.propertyAddress)(property === null || property === void 0 ? void 0 : property.streetAddress, property === null || property === void 0 ? void 0 : property.city, property === null || property === void 0 ? void 0 : property.state, property === null || property === void 0 ? void 0 : property.zip, property === null || property === void 0 ? void 0 : property.county))
            .replace('{{name}}', seller === null || seller === void 0 ? void 0 : seller.name)
            .replace('{{agreementUrl}}', `${config_1.default.client_Url}/agreement/${offer === null || offer === void 0 ? void 0 : offer._id}?email=${signer === null || signer === void 0 ? void 0 : signer.email}&user=seller`)
            .replace('{{year}}', new Date().getFullYear().toString()));
    }));
    return result;
});
exports.addSellerAuthorizedSigner = addSellerAuthorizedSigner;
const addBuyerAuthorizedSigner = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { $set: { isBuyerAddedAuthorizedSigner: true } }, { new: true })
        .populate('property')
        .populate('buyer')
        .populate('seller');
    let agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { $push: { buyerAuthorizeSigner: payload } }, { new: true });
    // Stamp the buyer name(s) into the correct slot(s) on the PDF now that the
    // full signer list for this agreement is known.
    if (agreement) {
        const updatedPdfUrl = yield (0, agreement_utils_1.updateSignerNamesOnPdf)(agreement.agreementMainDoc, agreement.buyerAuthorizeSigner, agreement._id.toString());
        agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { agreementMainDoc: updatedPdfUrl }, { new: true });
    }
    const contactEmailPath = path_1.default.join(__dirname, '../../../../public/view/agreement.html');
    const buyer = offer === null || offer === void 0 ? void 0 : offer.buyer;
    const property = offer === null || offer === void 0 ? void 0 : offer.property;
    payload.forEach((signer) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mailSender_1.sendEmail)(signer.email, 'You have been added as an authorized signer for a property agreement', fs_1.default
            .readFileSync(contactEmailPath, 'utf8')
            .replace('{{userName}}', signer.name)
            .replace('{{name}}', buyer === null || buyer === void 0 ? void 0 : buyer.name)
            .replace('{{propertyAddress}}', (0, properties_utils_1.propertyAddress)(property === null || property === void 0 ? void 0 : property.streetAddress, property === null || property === void 0 ? void 0 : property.city, property === null || property === void 0 ? void 0 : property.state, property === null || property === void 0 ? void 0 : property.zip, property === null || property === void 0 ? void 0 : property.county))
            .replace('{{name}}', buyer === null || buyer === void 0 ? void 0 : buyer.name)
            .replace('{{agreementUrl}}', `${config_1.default.client_Url}/agreement/${offer === null || offer === void 0 ? void 0 : offer._id}?email=${signer === null || signer === void 0 ? void 0 : signer.email}&user=buyer`)
            .replace('{{year}}', new Date().getFullYear().toString()));
    }));
    return agreement;
});
exports.addBuyerAuthorizedSigner = addBuyerAuthorizedSigner;
const signAgreement = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const agreement = yield agreement_model_1.Agreement.findOne({ offer: offerId });
    if (!agreement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Authorized signer not found');
    }
    // Buyer-only: only search the buyer's authorized signer list.
    const buyerIndex = findSignerIndexByEmail((_a = agreement.buyerAuthorizeSigner) !== null && _a !== void 0 ? _a : [], payload.email);
    if (buyerIndex < 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Buyer Authorized signer not found');
    }
    const signerRole = 'buyer';
    const signerIndex = buyerIndex;
    // Mutate the real subdocument directly — this correctly reads/writes through
    // its schema-defined getters/setters instead of trying to spread it.
    const signerSubdoc = agreement.buyerAuthorizeSigner[signerIndex];
    if (signerSubdoc.isSigned) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already signed');
    }
    signerSubdoc.isSigned = true;
    signerSubdoc.signatureImage = (_c = (_b = payload.signatureImage) !== null && _b !== void 0 ? _b : signerSubdoc.signatureImage) !== null && _c !== void 0 ? _c : '';
    signerSubdoc.signedAt = new Date();
    // Belt-and-suspenders: ensures Mongoose marks the array as changed even in
    // edge cases where nested subdocument mutation isn't auto-detected.
    agreement.markModified('buyerAuthorizeSigner');
    const sellerAuthorizeSigner = (_d = agreement.sellerAuthorizeSigner) !== null && _d !== void 0 ? _d : [];
    const areAllBuyerSignersSigned = agreement.buyerAuthorizeSigner.length
        ? agreement.buyerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;
    const areAllSellerSignersSigned = sellerAuthorizeSigner.length
        ? sellerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;
    const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;
    // @ts-ignore
    agreement.status = shouldCompleteAgreement ? agreement_constants_1.AGREEMENT_STATUS.completed : agreement.status;
    agreement.agreementMainDoc = yield (0, agreement_utils_1.updateSignedAgreementPdf)(agreement.toObject(), // safe here — toObject() correctly resolves all schema fields to plain values
    signerRole, signerIndex, payload.signatureImage);
    yield agreement.save();
    if (shouldCompleteAgreement) {
        yield properties_models_1.Property.findByIdAndUpdate(agreement.property, { status: properties_constants_1.STATUS.sold }, { new: true });
    }
    return agreement;
});
exports.signAgreement = signAgreement;
const getAgreements = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield agreement_model_1.Agreement.findOne({ offer: offerId });
    return result;
});
exports.getAgreements = getAgreements;
const getAgreementByOfferId = (offerId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield agreement_model_1.Agreement.findOne({ offer: offerId });
    return result;
});
exports.getAgreementByOfferId = getAgreementByOfferId;
exports.agreementService = {
    addSellerAuthorizedSigner: exports.addSellerAuthorizedSigner,
    addBuyerAuthorizedSigner: exports.addBuyerAuthorizedSigner,
    signAgreement: exports.signAgreement,
    getAgreements: exports.getAgreements,
    getAgreementByOfferId: exports.getAgreementByOfferId
};
