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
exports.updateSignerNamesOnPdf = exports.updateSignedAgreementPdf = void 0;
const axios_1 = __importDefault(require("axios"));
const pdf_lib_1 = require("pdf-lib");
const s3_1 = require("../../utils/s3");
const PAGE_2_SIGNER_LAYOUT = {
    1: {
        name: { x: 95, y: 501 },
        signature: { x: 75, y: 436, width: 232, height: 25 },
        date: { x: 90, y: 418 },
    },
    2: {
        name: { x: 95, y: 366 },
        signature: { x: 75, y: 302, width: 232, height: 25 },
        date: { x: 90, y: 286 },
    },
};
// "Sep 25, 2026" style, matching the date the signature was made
const formatSignedDate = (date) => date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});
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
        const fieldNames = (fieldName) => [fieldName, fieldName.replace(/_signature$/, '__signature')];
        const getSignatureField = (fieldName) => {
            var _a, _b, _c;
            const candidateNames = fieldNames(fieldName);
            for (const name of candidateNames) {
                try {
                    const field = form.getTextField(name);
                    const widgetList = (_c = (_b = (_a = field).getWidgets) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : [];
                    const widget = widgetList[0];
                    if (widget) {
                        return { field, widget, page: widget.getPage(), rect: widget.getRectangle() };
                    }
                }
                catch (_d) {
                    // ignore missing signature fields
                }
            }
            const match = fieldName.match(/buyer_(\d+)_signature/);
            const targetIndex = match ? Number(match[1]) : 1;
            const isDateField = fieldName.endsWith('_date');
            const page = pdfDoc.getPage(1);
            const layout = PAGE_2_SIGNER_LAYOUT[targetIndex];
            if (!layout) {
                console.warn(`No layout defined for signer index ${targetIndex} — template only has 2 signature slots on page 2`);
                return { field: null, widget: null, page, rect: { x: 0, y: 0, width: 0, height: 0 } };
            }
            const rect = isDateField
                ? { x: layout.date.x, y: layout.date.y, width: 200, height: 14 }
                : layout.signature;
            return { field: null, widget: null, page, rect };
        };
        const drawTextOnSignatureArea = (fieldName, value) => __awaiter(void 0, void 0, void 0, function* () {
            const target = getSignatureField(fieldName);
            if (!(target === null || target === void 0 ? void 0 : target.page)) {
                return;
            }
            const isDateField = fieldName.endsWith('_date');
            // Lighter weight for the date text — Helvetica has no true "Light" weight
            // built into pdf-lib's 14 standard fonts, so we approximate lightness
            // with a lighter gray fill rather than a bold/regular font swap.
            // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            target.page.drawText(String(value !== null && value !== void 0 ? value : ''), {
                x: target.rect.x + 6,
                y: target.rect.y - 4,
                size: isDateField ? 13 : 10,
                // font,
                color: isDateField ? (0, pdf_lib_1.rgb)(0.35, 0.35, 0.35) : (0, pdf_lib_1.rgb)(0, 0, 0),
            });
        });
        const setSignatureImageOnField = (fieldName, imageSource) => __awaiter(void 0, void 0, void 0, function* () {
            if (!imageSource) {
                return;
            }
            const trimmedImage = String(imageSource).trim();
            if (!trimmedImage) {
                return;
            }
            const imageData = trimmedImage.startsWith('data:image')
                ? trimmedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
                : trimmedImage;
            const buffer = Buffer.from(imageData, 'base64');
            if (!buffer.length) {
                return;
            }
            let image = null;
            try {
                const signatureHeader = buffer.subarray(0, 8).toString('hex');
                if (signatureHeader === '89504e470d0a1a0a') {
                    image = yield pdfDoc.embedPng(buffer);
                }
                else if (signatureHeader.startsWith('ffd8')) {
                    image = yield pdfDoc.embedJpg(buffer);
                }
            }
            catch (_a) {
                // ignore unsupported signature image data
            }
            if (!image) {
                return;
            }
            const target = getSignatureField(fieldName);
            if (!(target === null || target === void 0 ? void 0 : target.page) || !target.rect) {
                return;
            }
            // Preserve the signature's real aspect ratio instead of stretching it
            // to fill the box — scale to fit within the box, then center it.
            const boxWidth = target.rect.width;
            const boxHeight = target.rect.height;
            const imageAspectRatio = image.width / image.height;
            const boxAspectRatio = boxWidth / boxHeight;
            let drawWidth;
            let drawHeight;
            if (imageAspectRatio > boxAspectRatio) {
                // image is relatively wider than the box — constrain by width
                drawWidth = boxWidth;
                drawHeight = boxWidth / imageAspectRatio;
            }
            else {
                // image is relatively taller than the box — constrain by height
                drawHeight = boxHeight;
                drawWidth = boxHeight * imageAspectRatio;
            }
            // center the scaled image within the original box
            const offsetX = target.rect.x + (boxWidth - drawWidth) / 2;
            const offsetY = target.rect.y + (boxHeight - drawHeight) / 2;
            target.page.drawImage(image, {
                x: offsetX,
                y: offsetY,
                width: drawWidth,
                height: drawHeight,
            });
        });
        for (const [index, signer] of buyerSigners.entries()) {
            const fieldIndex = index + 1;
            if (signer === null || signer === void 0 ? void 0 : signer.signedAt) {
                yield drawTextOnSignatureArea(`buyer_${fieldIndex}_signature_date`, formatSignedDate(new Date(signer.signedAt)));
            }
            if ((signer === null || signer === void 0 ? void 0 : signer.isSigned) && (signer === null || signer === void 0 ? void 0 : signer.signatureImage)) {
                yield setSignatureImageOnField(`buyer_${fieldIndex}_signature`, signer.signatureImage);
            }
        }
        for (const [index, signer] of sellerSigners.entries()) {
            const fieldIndex = buyerSigners.length + index + 1;
            if (signer === null || signer === void 0 ? void 0 : signer.signedAt) {
                yield drawTextOnSignatureArea(`buyer_${fieldIndex}_signature_date`, formatSignedDate(new Date(signer.signedAt)));
            }
            if ((signer === null || signer === void 0 ? void 0 : signer.isSigned) && (signer === null || signer === void 0 ? void 0 : signer.signatureImage)) {
                yield setSignatureImageOnField(`buyer_${fieldIndex}_signature`, signer.signatureImage);
            }
        }
        const targetIndex = signerRole === 'buyer' ? signerIndex + 1 : buyerSigners.length + signerIndex + 1;
        const targetFieldName = `buyer_${targetIndex}_signature`;
        yield drawTextOnSignatureArea(`buyer_${targetIndex}_signature_date`, formatSignedDate(new Date()));
        yield setSignatureImageOnField(targetFieldName, signatureImage);
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
exports.updateSignedAgreementPdf = updateSignedAgreementPdf;
// Fills in the buyer name(s) at the "Name:" line for each signer slot on
// page 2. Handles 1 or 2 signers — index 0 goes to slot 1, index 1 to slot 2.
// Does NOT touch signature/date fields — call this only for name placement.
const updateSignerNamesOnPdf = (agreementMainDoc, buyerAuthorizeSigner, agreementId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!agreementMainDoc || !(buyerAuthorizeSigner === null || buyerAuthorizeSigner === void 0 ? void 0 : buyerAuthorizeSigner.length)) {
        return agreementMainDoc !== null && agreementMainDoc !== void 0 ? agreementMainDoc : null;
    }
    try {
        const response = yield axios_1.default.get(agreementMainDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = yield pdf_lib_1.PDFDocument.load(pdfBytes);
        // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const page = pdfDoc.getPage(1); // page index 1 = second page, where name slots live
        // Only slots 1 and 2 exist on this template — max 2 signers, matching the schema.
        buyerAuthorizeSigner.slice(0, 2).forEach((signer, index) => {
            var _a;
            const slotNumber = index + 1;
            const layout = PAGE_2_SIGNER_LAYOUT[slotNumber];
            if (!layout) {
                console.warn(`No layout defined for signer name slot ${slotNumber}`);
                return;
            }
            page.drawText(String((_a = signer.name) !== null && _a !== void 0 ? _a : ''), {
                x: layout.name.x,
                y: layout.name.y - 4,
                size: 13,
                // font,
                color: (0, pdf_lib_1.rgb)(0.35, 0.35, 0.35),
            });
        });
        const updatedPdf = yield pdfDoc.save();
        const fileName = `agreements/agreement_${agreementId !== null && agreementId !== void 0 ? agreementId : Date.now()}.pdf`;
        const updatedUrl = yield (0, s3_1.uploadToS3)({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName,
        });
        return updatedUrl !== null && updatedUrl !== void 0 ? updatedUrl : agreementMainDoc;
    }
    catch (error) {
        console.warn('Failed to stamp buyer names onto agreement PDF, keeping original PDF:', error);
        return agreementMainDoc;
    }
});
exports.updateSignerNamesOnPdf = updateSignerNamesOnPdf;
