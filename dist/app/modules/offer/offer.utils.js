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
exports.generateOfferPdf = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const s3_1 = require("../../utils/s3");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const formatCurrency = (value) => {
    const numericValue = Number(value !== null && value !== void 0 ? value : 0);
    if (!Number.isFinite(numericValue)) {
        return '$0';
    }
    return `${numericValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};
const getDisplayName = (person) => {
    var _a;
    if (!person || typeof person !== 'object') {
        return '';
    }
    const record = person;
    const name = (_a = record.name) !== null && _a !== void 0 ? _a : record.fullName;
    return String(name !== null && name !== void 0 ? name : '').trim();
};
const getPropertyAddress = (property) => {
    if (!property || typeof property !== 'object') {
        return '';
    }
    const record = property;
    return [
        record.streetAddress,
        record.city,
        record.state,
        record.zipCode,
        record.county,
    ]
        .filter((value) => Boolean(value))
        .map((value) => String(value).trim())
        .join(', ');
};
const generateOfferPdf = (offer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const pdfPath = path_1.default.join(process.cwd(), 'offer_agreement.pdf');
        if (!fs_1.default.existsSync(pdfPath)) {
            console.error('Offer PDF template not found at:', pdfPath);
            return null;
        }
        const pdfBytes = fs_1.default.readFileSync(pdfPath);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const buyer = (_a = offer === null || offer === void 0 ? void 0 : offer.buyer) !== null && _a !== void 0 ? _a : {};
        const seller = (_b = offer === null || offer === void 0 ? void 0 : offer.seller) !== null && _b !== void 0 ? _b : {};
        const property = (_c = offer === null || offer === void 0 ? void 0 : offer.property) !== null && _c !== void 0 ? _c : {};
        const terms = (_d = offer === null || offer === void 0 ? void 0 : offer.currentTerms) !== null && _d !== void 0 ? _d : {};
        const setFieldText = (fieldName, value) => {
            try {
                const field = form.getTextField(fieldName);
                field.setText(value || '');
            }
            catch (_a) {
                // ignore missing field names in the template
            }
        };
        const buyerName = getDisplayName(buyer);
        const sellerName = getDisplayName(seller);
        const propertyAddress = getPropertyAddress(property);
        const offerAmount = Number((_f = (_e = terms === null || terms === void 0 ? void 0 : terms.offerAmount) !== null && _e !== void 0 ? _e : property === null || property === void 0 ? void 0 : property.listingPrice) !== null && _f !== void 0 ? _f : 0);
        const commissionAmount = offerAmount * 0.02;
        console.log(formatCurrency(offerAmount), formatCurrency(commissionAmount), offerAmount, commissionAmount, propertyAddress);
        setFieldText('property_address', propertyAddress);
        setFieldText('property_amount', formatCurrency(offerAmount));
        setFieldText('property_amount_with_commission', formatCurrency(commissionAmount));
        setFieldText('buyer_1_name', buyerName);
        setFieldText('buyer_1_signature', '');
        setFieldText('buyer_1_signature_date', '');
        setFieldText('buyer_2_name', sellerName);
        setFieldText('buyer_2_signature', '');
        setFieldText('buyer_2_signature_date', '');
        form.flatten();
        const generatedPdf = yield pdfDoc.save();
        const fileName = `offers/offer_agreement_${Date.now()}.pdf`;
        try {
            const uploadedUrl = yield (0, s3_1.uploadToS3)({
                file: { buffer: generatedPdf, mimetype: 'application/pdf' },
                fileName,
            });
            if (uploadedUrl) {
                return uploadedUrl;
            }
        }
        catch (error) {
            console.warn('S3 upload failed for generated offer PDF, falling back to local file:', error);
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to generate offer PDF');
        }
        // const outputDir = path.join(process.cwd(), 'generated-offers');
        // fs.mkdirSync(outputDir, { recursive: true });
        // const localFilePath = path.join(outputDir, fileName.replace(/\//g, '_'));
        // fs.writeFileSync(localFilePath, generatedPdf);
        // return localFilePath;
    }
    catch (error) {
        console.error('Error generating offer PDF:', error);
        return null;
    }
});
exports.generateOfferPdf = generateOfferPdf;
