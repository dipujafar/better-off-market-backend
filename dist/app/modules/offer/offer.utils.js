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
exports.generatePropertyPdf = exports.generateOfferPdf = void 0;
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
const formatPdfDate = (value) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return '';
        }
        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
        return trimmed;
    }
    if (value instanceof Date) {
        return value.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }
    return String(value);
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
const setFieldText = (form, fieldName, value) => {
    try {
        const field = form.getTextField(fieldName);
        field.setText(value == null || value === '' ? '' : String(value));
    }
    catch (_a) {
        // ignore missing field names in the template
    }
};
const setCheckedField = (form, fieldName, checked, symbolFont) => {
    if (!checked) {
        setFieldText(form, fieldName, '');
        return;
    }
    try {
        const field = form.getTextField(fieldName);
        // Use the PDF-safe ZapfDingbats check mark glyph instead of Unicode ✓,
        // because the template fonts are WinAnsi-based and reject non-encoded characters.
        field.setText('\u2713');
        field.setFontSize(12);
        if (symbolFont) {
            field.updateAppearances(symbolFont);
        }
    }
    catch (_a) {
        // ignored if the template field is absent
    }
};
const uploadGeneratedPdf = (pdfBuffer, fileName, pdfType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedUrl = yield (0, s3_1.uploadToS3)({
            file: { buffer: pdfBuffer, mimetype: 'application/pdf' },
            fileName,
        });
        if (uploadedUrl) {
            return uploadedUrl;
        }
    }
    catch (error) {
        console.warn(`S3 upload failed for generated ${pdfType} PDF:`, error);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to generate ${pdfType} PDF`);
    }
    return null;
});
const generateOfferPdf = (offer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const pdfPath = path_1.default.join(process.cwd(), 'offer_agreement.pdf');
        if (!fs_1.default.existsSync(pdfPath)) {
            console.error('Offer PDF template not found at:', pdfPath);
            return null;
        }
        const pdfBytes = fs_1.default.readFileSync(pdfPath);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const property = (_a = offer === null || offer === void 0 ? void 0 : offer.property) !== null && _a !== void 0 ? _a : {};
        const terms = (_b = offer === null || offer === void 0 ? void 0 : offer.currentTerms) !== null && _b !== void 0 ? _b : {};
        const propertyAddress = getPropertyAddress(property);
        const offerAmount = Number((_d = (_c = terms === null || terms === void 0 ? void 0 : terms.offerAmount) !== null && _c !== void 0 ? _c : property === null || property === void 0 ? void 0 : property.listingPrice) !== null && _d !== void 0 ? _d : 0);
        const commissionAmount = offerAmount * 0.02;
        setFieldText(form, 'property_address', propertyAddress);
        setFieldText(form, 'property_amount', formatCurrency(offerAmount));
        setFieldText(form, 'property_amount_with_commission', formatCurrency(commissionAmount));
        setFieldText(form, 'buyer_1_name', '');
        setFieldText(form, 'buyer_1_signature', '');
        setFieldText(form, 'buyer_1_signature_date', '');
        setFieldText(form, 'buyer_2_name', '');
        setFieldText(form, 'buyer_2_signature', '');
        setFieldText(form, 'buyer_2_signature_date', '');
        form.flatten();
        const generatedPdf = yield pdfDoc.save();
        const fileName = `offers/offer_agreement_${Date.now()}.pdf`;
        return uploadGeneratedPdf(generatedPdf, fileName, 'offer');
    }
    catch (error) {
        console.error('Error generating offer PDF:', error);
        return null;
    }
});
exports.generateOfferPdf = generateOfferPdf;
const generatePropertyPdf = (offer) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    try {
        const property = (_a = offer === null || offer === void 0 ? void 0 : offer.property) !== null && _a !== void 0 ? _a : {};
        const pdfPath = path_1.default.join(process.cwd(), (property === null || property === void 0 ? void 0 : property.countyType) === 'OHIO' ? 'ohio_property_agreement.pdf' : 'kentuncky_property_agreement.pdf');
        if (!fs_1.default.existsSync(pdfPath)) {
            console.error('Property PDF template not found at:', pdfPath);
            return null;
        }
        const pdfBytes = fs_1.default.readFileSync(pdfPath);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const terms = (_b = offer === null || offer === void 0 ? void 0 : offer.currentTerms) !== null && _b !== void 0 ? _b : {};
        const offerAmount = Number((_c = terms === null || terms === void 0 ? void 0 : terms.offerAmount) !== null && _c !== void 0 ? _c : 0);
        const earnestMoney = Number((_d = terms === null || terms === void 0 ? void 0 : terms.earnestMoney) !== null && _d !== void 0 ? _d : 0);
        const balanceDue = Math.max(offerAmount - earnestMoney, 0);
        const symbolFont = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.ZapfDingbats);
        setFieldText(form, 'property_address', getPropertyAddress(property));
        setFieldText(form, 'parcel_id', (_e = property === null || property === void 0 ? void 0 : property.parcelIds) !== null && _e !== void 0 ? _e : '');
        setFieldText(form, 'purchase_price', formatCurrency(offerAmount));
        setFieldText(form, 'earnest_money', formatCurrency(earnestMoney));
        setFieldText(form, 'balance_due', formatCurrency(balanceDue));
        setFieldText(form, 'company_title', (_g = (_f = terms === null || terms === void 0 ? void 0 : terms.titleCompany) !== null && _f !== void 0 ? _f : property === null || property === void 0 ? void 0 : property.titleCompany) !== null && _g !== void 0 ? _g : '');
        setCheckedField(form, 'financing_check_cash', (terms === null || terms === void 0 ? void 0 : terms.financingType) === 'cash', symbolFont);
        setCheckedField(form, 'financing_check_conventional', (terms === null || terms === void 0 ? void 0 : terms.financingType) === 'conventional', symbolFont);
        setCheckedField(form, 'financing_check_hard', (terms === null || terms === void 0 ? void 0 : terms.financingType) === 'hard_money', symbolFont);
        setCheckedField(form, 'financing_check_other', (terms === null || terms === void 0 ? void 0 : terms.financingType) === 'other', symbolFont);
        setFieldText(form, 'financing_check_other_text', (terms === null || terms === void 0 ? void 0 : terms.financingType) === 'other' ? (_h = terms === null || terms === void 0 ? void 0 : terms.otherFinancingType) !== null && _h !== void 0 ? _h : '' : '');
        setFieldText(form, 'financingTerms', (_j = terms === null || terms === void 0 ? void 0 : terms.financingTerms) !== null && _j !== void 0 ? _j : '');
        setFieldText(form, 'seller_paid', Number((_k = terms === null || terms === void 0 ? void 0 : terms.sellerContribution) !== null && _k !== void 0 ? _k : 0));
        setCheckedField(form, 'inspection_waived', (terms === null || terms === void 0 ? void 0 : terms.inspectionContingency) === 'no', symbolFont);
        setCheckedField(form, 'inspection_applies', (terms === null || terms === void 0 ? void 0 : terms.inspectionContingency) === 'yes', symbolFont);
        setFieldText(form, 'inspection_days', (terms === null || terms === void 0 ? void 0 : terms.inspectionContingency) === 'yes' ? (_l = terms === null || terms === void 0 ? void 0 : terms.inspectionDays) !== null && _l !== void 0 ? _l : '' : '');
        setCheckedField(form, 'appraisal_waived', (terms === null || terms === void 0 ? void 0 : terms.appraisalContingency) === 'no', symbolFont);
        setCheckedField(form, 'appraisal_applies', (terms === null || terms === void 0 ? void 0 : terms.appraisalContingency) === 'yes', symbolFont);
        setCheckedField(form, 'not_real_estate', (terms === null || terms === void 0 ? void 0 : terms.hasAgent) === 'no', symbolFont);
        setCheckedField(form, 'real_estate', (terms === null || terms === void 0 ? void 0 : terms.hasAgent) === 'yes', symbolFont);
        setFieldText(form, 'agent_name', (terms === null || terms === void 0 ? void 0 : terms.hasAgent) === 'yes' ? (_m = terms === null || terms === void 0 ? void 0 : terms.agentName) !== null && _m !== void 0 ? _m : '' : '');
        setFieldText(form, 'brokerage_name', (terms === null || terms === void 0 ? void 0 : terms.hasAgent) === 'yes' ? (_o = terms === null || terms === void 0 ? void 0 : terms.brokerageName) !== null && _o !== void 0 ? _o : '' : '');
        setFieldText(form, 'commission', (terms === null || terms === void 0 ? void 0 : terms.hasAgent) === 'yes' ? (_p = terms === null || terms === void 0 ? void 0 : terms.commission) !== null && _p !== void 0 ? _p : '' : '');
        setCheckedField(form, 'commission_paid_buyer', (terms === null || terms === void 0 ? void 0 : terms.paidBy) === 'buyer', symbolFont);
        setCheckedField(form, 'commission_paid_seller', (terms === null || terms === void 0 ? void 0 : terms.paidBy) === 'seller', symbolFont);
        setFieldText(form, 'personal_property_included', (_q = terms === null || terms === void 0 ? void 0 : terms.personalPropertyIncluded) !== null && _q !== void 0 ? _q : '');
        setFieldText(form, 'personal_property_excluded', (_r = terms === null || terms === void 0 ? void 0 : terms.itemsToBeRemoved) !== null && _r !== void 0 ? _r : '');
        setFieldText(form, 'additional_terms', (_s = terms === null || terms === void 0 ? void 0 : terms.additionalTerms) !== null && _s !== void 0 ? _s : '');
        setFieldText(form, 'closing_date', formatPdfDate((_u = (_t = terms === null || terms === void 0 ? void 0 : terms.closingDate) !== null && _t !== void 0 ? _t : property === null || property === void 0 ? void 0 : property.closingDate) !== null && _u !== void 0 ? _u : ''));
        setCheckedField(form, 'at__closing', (terms === null || terms === void 0 ? void 0 : terms.possession) === 'at_closing', symbolFont);
        setCheckedField(form, 'post__closing', (terms === null || terms === void 0 ? void 0 : terms.possession) === 'post_closing', symbolFont);
        setFieldText(form, 'post__closing_days', (terms === null || terms === void 0 ? void 0 : terms.possession) === 'post_closing' ? (_v = terms === null || terms === void 0 ? void 0 : terms.sellerPostClosingDays) !== null && _v !== void 0 ? _v : '' : '');
        setCheckedField(form, 'not_HOA', (property === null || property === void 0 ? void 0 : property.hasHoa) === 'no', symbolFont);
        setCheckedField(form, 'HOA', (property === null || property === void 0 ? void 0 : property.hasHoa) === 'yes', symbolFont);
        setFieldText(form, 'HOA_AMOUNT', (property === null || property === void 0 ? void 0 : property.hasHoa) === 'yes' ? (_w = property === null || property === void 0 ? void 0 : property.hoaAmount) !== null && _w !== void 0 ? _w : '' : '');
        setFieldText(form, 'HOA_PAID', (property === null || property === void 0 ? void 0 : property.hasHoa) === 'yes' ? (_x = property === null || property === void 0 ? void 0 : property.hoaFrequency) !== null && _x !== void 0 ? _x : '' : '');
        setFieldText(form, 'included_in_HOA', (property === null || property === void 0 ? void 0 : property.hasHoa) === 'yes' ? (_y = property === null || property === void 0 ? void 0 : property.hoaIncludes) !== null && _y !== void 0 ? _y : '' : '');
        form.flatten();
        const generatedPdf = yield pdfDoc.save();
        const fileName = `properties/${(property === null || property === void 0 ? void 0 : property.countyType) === 'OHIO' ? 'ohio' : "kentuncky"}_property_agreement_${Date.now()}.pdf`;
        return uploadGeneratedPdf(generatedPdf, fileName, 'property');
    }
    catch (error) {
        console.error('Error generating property PDF:', error);
        return null;
    }
});
exports.generatePropertyPdf = generatePropertyPdf;
