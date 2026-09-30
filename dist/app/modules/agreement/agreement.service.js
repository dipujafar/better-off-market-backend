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
exports.agreementService = exports.getAgreementByOfferId = exports.getAgreements = exports.signDocument = exports.addBuyerAuthorizedSigner = exports.addSellerAuthorizedSigner = void 0;
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
    var _a;
    const offer = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { $set: { isSellerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');
    let agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { $push: { sellerAuthorizeSigner: payload } }, { new: true });
    const property = offer === null || offer === void 0 ? void 0 : offer.property;
    if (agreement) {
        const propertyDocUrl = yield (0, agreement_utils_1.updatePropertyAgreementParties)(agreement.propertyAgreementDoc, 'seller', agreement.sellerAuthorizeSigner, agreement._id.toString(), (_a = property === null || property === void 0 ? void 0 : property.countyType) !== null && _a !== void 0 ? _a : '');
        agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { propertyAgreementDoc: propertyDocUrl }, { new: true });
    }
    const contactEmailPath = path_1.default.join(__dirname, '../../../../public/view/agreement.html');
    const seller = offer === null || offer === void 0 ? void 0 : offer.seller;
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
    return agreement;
});
exports.addSellerAuthorizedSigner = addSellerAuthorizedSigner;
const addBuyerAuthorizedSigner = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const offer = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { $set: { isBuyerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');
    const property = offer === null || offer === void 0 ? void 0 : offer.property;
    let agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { $push: { buyerAuthorizeSigner: payload } }, { new: true });
    if (agreement) {
        // two independent PDFs, so stamp them in parallel
        const [mainDocUrl, propertyDocUrl] = yield Promise.all([
            (0, agreement_utils_1.updateSignerNamesOnPdf)(agreement.agreementMainDoc, agreement.buyerAuthorizeSigner, agreement._id.toString()),
            (0, agreement_utils_1.updatePropertyAgreementParties)(agreement.propertyAgreementDoc, 'buyer', agreement.buyerAuthorizeSigner, agreement._id.toString(), (_a = property === null || property === void 0 ? void 0 : property.countyType) !== null && _a !== void 0 ? _a : ''),
        ]);
        agreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { agreementMainDoc: mainDocUrl, propertyAgreementDoc: propertyDocUrl }, { new: true });
    }
    const contactEmailPath = path_1.default.join(__dirname, '../../../../public/view/agreement.html');
    const buyer = offer === null || offer === void 0 ? void 0 : offer.buyer;
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
const signDocument = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const agreement = yield agreement_model_1.Agreement.findOne({ offer: offerId }).populate('property');
    if (!agreement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Authorized signer not found');
    }
    const property = agreement.property;
    // Assumption: distinguishing the two document layouts by the property's
    // state — adjust this if countyType is actually stored elsewhere.
    const countyType = ((_a = property === null || property === void 0 ? void 0 : property.state) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'OHIO' ? 'OHIO' : 'OTHER';
    if (payload.role === 'buyer') {
        const buyerIndex = findSignerIndexByEmail((_b = agreement.buyerAuthorizeSigner) !== null && _b !== void 0 ? _b : [], payload.email);
        if (buyerIndex < 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Buyer Authorized signer not found');
        }
        const signerSubdoc = agreement.buyerAuthorizeSigner[buyerIndex];
        if (signerSubdoc.isSigned) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already signed');
        }
        const signedAt = new Date();
        signerSubdoc.isSigned = true;
        signerSubdoc.signatureImage = (_d = (_c = payload.signatureImage) !== null && _c !== void 0 ? _c : signerSubdoc.signatureImage) !== null && _d !== void 0 ? _d : '';
        signerSubdoc.signedAt = signedAt;
        agreement.markModified('buyerAuthorizeSigner');
        const sellerAuthorizeSigner = (_e = agreement.sellerAuthorizeSigner) !== null && _e !== void 0 ? _e : [];
        const areAllBuyerSignersSigned = agreement.buyerAuthorizeSigner.length
            ? agreement.buyerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;
        const areAllSellerSignersSigned = sellerAuthorizeSigner.length
            ? sellerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;
        const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;
        // existing behavior: stamp the main doc
        agreement.agreementMainDoc = yield (0, agreement_utils_1.updateSignedAgreementPdf)(agreement.toObject(), 'buyer', buyerIndex, payload.signatureImage);
        // additionally: stamp the buyer's signature/date onto the property
        // agreement's page 10, buyer slot
        agreement.propertyAgreementDoc = yield (0, agreement_utils_1.updatePropertyAgreementSignature)(agreement.propertyAgreementDoc, 'buyer', (buyerIndex + 1), payload.signatureImage, signedAt, agreement._id.toString(), countyType);
        // @ts-ignore
        agreement.status = shouldCompleteAgreement ? agreement_constants_1.AGREEMENT_STATUS.completed : agreement.status;
        yield agreement.save();
        if (shouldCompleteAgreement) {
            yield properties_models_1.Property.findByIdAndUpdate(agreement.property, { status: properties_constants_1.STATUS.sold }, { new: true });
        }
        return agreement;
    }
    if (payload.role === 'seller') {
        const sellerIndex = findSignerIndexByEmail((_f = agreement.sellerAuthorizeSigner) !== null && _f !== void 0 ? _f : [], payload.email);
        if (sellerIndex < 0) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Seller Authorized signer not found');
        }
        const signerSubdoc = agreement.sellerAuthorizeSigner[sellerIndex];
        if (signerSubdoc.isSigned) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have already signed');
        }
        const signedAt = new Date();
        signerSubdoc.isSigned = true;
        signerSubdoc.signatureImage = (_h = (_g = payload.signatureImage) !== null && _g !== void 0 ? _g : signerSubdoc.signatureImage) !== null && _h !== void 0 ? _h : '';
        signerSubdoc.signedAt = signedAt;
        agreement.markModified('sellerAuthorizeSigner');
        const buyerAuthorizeSigner = (_j = agreement.buyerAuthorizeSigner) !== null && _j !== void 0 ? _j : [];
        const areAllBuyerSignersSigned = buyerAuthorizeSigner.length
            ? buyerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;
        const areAllSellerSignersSigned = agreement.sellerAuthorizeSigner.length
            ? agreement.sellerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;
        const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;
        // seller never touches agreementMainDoc — only the property agreement doc
        agreement.propertyAgreementDoc = yield (0, agreement_utils_1.updatePropertyAgreementSignature)(agreement.propertyAgreementDoc, 'seller', (sellerIndex + 1), payload.signatureImage, signedAt, agreement._id.toString(), countyType);
        // @ts-ignore
        agreement.status = shouldCompleteAgreement ? agreement_constants_1.AGREEMENT_STATUS.completed : agreement.status;
        yield agreement.save();
        if (shouldCompleteAgreement) {
            yield properties_models_1.Property.findByIdAndUpdate(agreement.property, { status: properties_constants_1.STATUS.sold }, { new: true });
        }
        return agreement;
    }
    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid signer role');
});
exports.signDocument = signDocument;
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
    signDocument: exports.signDocument,
    getAgreements: exports.getAgreements,
    getAgreementByOfferId: exports.getAgreementByOfferId
};
