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
const axios_1 = __importDefault(require("axios"));
const http_status_1 = __importDefault(require("http-status"));
const pdf_lib_1 = require("pdf-lib");
const mailSender_1 = require("../../utils/mailSender");
const config_1 = __importDefault(require("../../config"));
const properties_utils_1 = require("../properties/properties.utils");
const AppError_1 = __importDefault(require("../../error/AppError"));
const properties_models_1 = require("../properties/properties.models");
const properties_constants_1 = require("../properties/properties.constants");
const s3_1 = require("../../utils/s3");
const agreement_constants_1 = require("./agreement.constants");
const findSignerIndexByEmail = (signers = [], email) => {
    const normalizedEmail = String(email !== null && email !== void 0 ? email : '').trim().toLowerCase();
    return signers.findIndex((signer) => { var _a; return String((_a = signer.email) !== null && _a !== void 0 ? _a : '').trim().toLowerCase() === normalizedEmail; });
};
const updateSignedAgreementPdf = (agreement, signerRole, signerIndex, signatureImage) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!(agreement === null || agreement === void 0 ? void 0 : agreement.agreementMainDoc)) {
        return (_a = agreement === null || agreement === void 0 ? void 0 : agreement.agreementMainDoc) !== null && _a !== void 0 ? _a : null;
    }
    try {
        const response = yield axios_1.default.get(agreement.agreementMainDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const buyerSigners = Array.isArray(agreement.buyerAuthorizeSigner) ? agreement.buyerAuthorizeSigner : [];
        const sellerSigners = Array.isArray(agreement.sellerAuthorizeSigner) ? agreement.sellerAuthorizeSigner : [];
        const setFieldText = (fieldName, value) => {
            try {
                const field = form.getTextField(fieldName);
                field.setText(value !== null && value !== void 0 ? value : '');
            }
            catch (_a) {
                // ignore missing template fields
            }
        };
        buyerSigners.forEach((signer, index) => {
            var _a;
            setFieldText(`buyer_${index + 1}_name`, (_a = signer === null || signer === void 0 ? void 0 : signer.name) !== null && _a !== void 0 ? _a : '');
            setFieldText(`buyer_${index + 1}_signature`, (signer === null || signer === void 0 ? void 0 : signer.isSigned) ? 'Signed' : '');
            setFieldText(`buyer_${index + 1}_signature_date`, (signer === null || signer === void 0 ? void 0 : signer.signedAt) ? new Date(signer.signedAt).toLocaleDateString('en-US') : '');
        });
        sellerSigners.forEach((signer, index) => {
            var _a;
            const fieldIndex = buyerSigners.length + index + 1;
            setFieldText(`buyer_${fieldIndex}_name`, (_a = signer === null || signer === void 0 ? void 0 : signer.name) !== null && _a !== void 0 ? _a : '');
            setFieldText(`buyer_${fieldIndex}_signature`, (signer === null || signer === void 0 ? void 0 : signer.isSigned) ? 'Signed' : '');
            setFieldText(`buyer_${fieldIndex}_signature_date`, (signer === null || signer === void 0 ? void 0 : signer.signedAt) ? new Date(signer.signedAt).toLocaleDateString('en-US') : '');
        });
        const targetIndex = signerRole === 'buyer'
            ? signerIndex + 1
            : buyerSigners.length + signerIndex + 1;
        setFieldText(`buyer_${targetIndex}_signature`, 'Signed');
        setFieldText(`buyer_${targetIndex}_signature_date`, new Date().toLocaleDateString('en-US'));
        const updatedPdf = yield pdfDoc.save();
        const fileName = `agreements/agreement_${(_b = agreement === null || agreement === void 0 ? void 0 : agreement._id) !== null && _b !== void 0 ? _b : Date.now()}.pdf`;
        const updatedUrl = yield (0, s3_1.uploadToS3)({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName,
        });
        return updatedUrl !== null && updatedUrl !== void 0 ? updatedUrl : agreement.agreementMainDoc;
    }
    catch (error) {
        console.warn('Failed to update agreement PDF after signature, keeping original PDF:', error);
        return agreement.agreementMainDoc;
    }
});
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
            .replace('{{agreementUrl}}', `${config_1.default.client_Url}/agreement/${offer === null || offer === void 0 ? void 0 : offer._id}?email=${signer === null || signer === void 0 ? void 0 : signer.email}?user=seller`)
            .replace('{{year}}', new Date().getFullYear().toString()));
    }));
    return result;
});
exports.addSellerAuthorizedSigner = addSellerAuthorizedSigner;
const addBuyerAuthorizedSigner = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_models_1.Offer.findByIdAndUpdate(offerId, { $set: { isBuyerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');
    const result = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, { $push: { buyerAuthorizeSigner: payload } }, { new: true });
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
            .replace('{{agreementUrl}}', `${config_1.default.client_Url}/agreement/${offer === null || offer === void 0 ? void 0 : offer._id}?email=${signer === null || signer === void 0 ? void 0 : signer.email}?user=buyer`)
            .replace('{{year}}', new Date().getFullYear().toString()));
    }));
    return result;
});
exports.addBuyerAuthorizedSigner = addBuyerAuthorizedSigner;
const signAgreement = (offerId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const agreement = yield agreement_model_1.Agreement.findOne({ offer: offerId });
    if (!agreement) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Authorized signer not found');
    }
    const buyerIndex = findSignerIndexByEmail((_a = agreement.buyerAuthorizeSigner) !== null && _a !== void 0 ? _a : [], payload.email);
    const sellerIndex = findSignerIndexByEmail((_b = agreement.sellerAuthorizeSigner) !== null && _b !== void 0 ? _b : [], payload.email);
    if (buyerIndex < 0 && sellerIndex < 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Authorized signer not found');
    }
    const signerRole = buyerIndex >= 0 ? 'buyer' : 'seller';
    const signerArray = signerRole === 'buyer' ? agreement.buyerAuthorizeSigner : agreement.sellerAuthorizeSigner;
    const signerIndex = signerRole === 'buyer' ? buyerIndex : sellerIndex;
    const updatedSignerArray = (signerArray !== null && signerArray !== void 0 ? signerArray : []).map((signer, index) => {
        var _a, _b;
        if (index !== signerIndex)
            return signer;
        return Object.assign(Object.assign({}, signer), { isSigned: true, signatureImage: (_b = (_a = payload.signatureImage) !== null && _a !== void 0 ? _a : signer.signatureImage) !== null && _b !== void 0 ? _b : '', signedAt: new Date() });
    });
    const updatedBuyerAuthorizeSigner = signerRole === 'buyer'
        ? updatedSignerArray
        : (_c = agreement.buyerAuthorizeSigner) !== null && _c !== void 0 ? _c : [];
    const updatedSellerAuthorizeSigner = signerRole === 'seller'
        ? updatedSignerArray
        : (_d = agreement.sellerAuthorizeSigner) !== null && _d !== void 0 ? _d : [];
    const areAllBuyerSignersSigned = updatedBuyerAuthorizeSigner.length
        ? updatedBuyerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;
    const areAllSellerSignersSigned = updatedSellerAuthorizeSigner.length
        ? updatedSellerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;
    const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;
    const updatedAgreement = yield agreement_model_1.Agreement.findOneAndUpdate({ offer: offerId }, {
        buyerAuthorizeSigner: updatedBuyerAuthorizeSigner,
        sellerAuthorizeSigner: updatedSellerAuthorizeSigner,
        status: shouldCompleteAgreement ? agreement_constants_1.AGREEMENT_STATUS.completed : agreement.status,
        agreementMainDoc: yield updateSignedAgreementPdf(Object.assign(Object.assign({}, (_f = (_e = agreement.toObject) === null || _e === void 0 ? void 0 : _e.call(agreement)) !== null && _f !== void 0 ? _f : agreement), { buyerAuthorizeSigner: updatedBuyerAuthorizeSigner, sellerAuthorizeSigner: updatedSellerAuthorizeSigner }), signerRole, signerIndex, payload.signatureImage),
    }, { new: true });
    if (shouldCompleteAgreement) {
        yield properties_models_1.Property.findByIdAndUpdate(agreement.property, { status: properties_constants_1.STATUS.sold }, { new: true });
    }
    return updatedAgreement;
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
