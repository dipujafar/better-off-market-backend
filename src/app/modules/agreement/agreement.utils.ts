import axios from 'axios';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { uploadToS3 } from '../../utils/s3';

const PAGE_2_SIGNER_LAYOUT: Record<
    number,
    {
        name: { x: number; y: number };
        signature: { x: number; y: number; width: number; height: number };
        date: { x: number; y: number };
    }
> = {
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


const PROPERTY_AGREEMENT_LAYOUT = (countyType: string) => {
    return countyType === 'OHIO' ?
        {
            partiesPage: {
                pageIndex: 0,
                maxWidth: 480,
                seller: { x: 76, y: 618 },
                buyer: { x: 76, y: 590 },
            },

            emailsPage: {
                pageIndex: 8,
                maxWidth: 440,
                seller: { x: 108, y: 442 },
                buyer: { x: 108, y: 414 },
            },

            signaturePage: {
                pageIndex: 9,
                maxWidth: 265,
                buyer: {
                    1: { x: 80, y: 585 },
                    2: { x: 80, y: 474 },
                },
                seller: {
                    1: { x: 80, y: 321 },
                    2: { x: 80, y: 210 },
                },
            },
        }

        : {
            partiesPage: {
                pageIndex: 0,
                maxWidth: 480,
                seller: { x: 76, y: 618 },
                buyer: { x: 76, y: 590 },
            },

            emailsPage: {
                pageIndex: 8,
                maxWidth: 440,
                seller: { x: 108, y: 322 },
                buyer: { x: 108, y: 295 },
            },

            signaturePage: {
                pageIndex: 9,
                maxWidth: 265,
                buyer: {
                    1: { x: 80, y: 585 },
                    2: { x: 80, y: 474 },
                },
                seller: {
                    1: { x: 80, y: 321 },
                    2: { x: 80, y: 210 },
                },
            },
        }
}


// Per-countyType, per-role, per-slot offsets — each document layout has its
// own Name→Signature/Date gap, so these can't share one flat table.
const SIGNATURE_DATE_ROW_OFFSETS: Record<
    string,
    Record<PartyRole, Record<1 | 2, { signature: number; date: number }>>
> = {
    OHIO: {
        buyer: {
            1: { signature: 63, date: 56 },
            2: { signature: 63, date: 56 },
        },
        seller: {
            1: { signature: 63, date: 56 },
            2: { signature: 63, date: 56 },
        },
    },
    OTHER: {
        buyer: {
            1: { signature: 63, date: 56 },
            2: { signature: 63, date: 56 },
        },
        seller: {
            1: { signature: 63, date: 56 },
            2: { signature: 63, date: 56 },
        },
    },
};



// "Sep 25, 2026" style, matching the date the signature was made
const formatSignedDate = (date: Date): string =>
    date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

export const updateSignedAgreementPdf = async (
    agreement: any,
    signerRole: 'buyer' | 'seller',
    signerIndex: number,
    signatureImage?: string,
) => {
    if (!agreement?.agreementMainDoc) {
        return agreement?.agreementMainDoc ?? null;
    }

    try {
        const response = await axios.get(agreement.agreementMainDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        const buyerSigners = Array.isArray(agreement.buyerAuthorizeSigner) ? agreement.buyerAuthorizeSigner : [];
        const sellerSigners = Array.isArray(agreement.sellerAuthorizeSigner) ? agreement.sellerAuthorizeSigner : [];

        const fieldNames = (fieldName: string) => [fieldName, fieldName.replace(/_signature$/, '__signature')];

        const getSignatureField = (fieldName: string) => {
            const candidateNames = fieldNames(fieldName);

            for (const name of candidateNames) {
                try {
                    const field = form.getTextField(name);
                    const widgetList = (field as any).getWidgets?.() ?? [];
                    const widget = widgetList[0];
                    if (widget) {
                        return { field, widget, page: widget.getPage(), rect: widget.getRectangle() };
                    }
                } catch {
                    // ignore missing signature fields
                }
            }

            const match = fieldName.match(/buyer_(\d+)_signature/);
            const targetIndex = match ? Number(match[1]) : 1;
            const isDateField = fieldName.endsWith('_date');

            const page = pdfDoc.getPage(1);
            const layout = PAGE_2_SIGNER_LAYOUT[targetIndex];

            if (!layout) {
                console.warn(
                    `No layout defined for signer index ${targetIndex} — template only has 2 signature slots on page 2`,
                );
                return { field: null, widget: null, page, rect: { x: 0, y: 0, width: 0, height: 0 } };
            }

            const rect = isDateField
                ? { x: layout.date.x, y: layout.date.y, width: 200, height: 14 }
                : layout.signature;

            return { field: null, widget: null, page, rect };
        };

        const drawTextOnSignatureArea = async (fieldName: string, value: string | null | undefined) => {
            const target = getSignatureField(fieldName);
            if (!target?.page) {
                return;
            }

            // const isDateField = fieldName.endsWith('_date');
            // Lighter weight for the date text — Helvetica has no true "Light" weight
            // built into pdf-lib's 14 standard fonts, so we approximate lightness
            // with a lighter gray fill rather than a bold/regular font swap.
            // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            target.page.drawText(String(value ?? ''), {
                x: target.rect.x + 6,
                y: target.rect.y - 4,
                size: 11,
                // font,
                color: rgb(0, 0, 0)
            });
        };

        const setSignatureImageOnField = async (fieldName: string, imageSource?: string) => {
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

            let image: any = null;
            try {
                const signatureHeader = buffer.subarray(0, 8).toString('hex');
                if (signatureHeader === '89504e470d0a1a0a') {
                    image = await pdfDoc.embedPng(buffer);
                } else if (signatureHeader.startsWith('ffd8')) {
                    image = await pdfDoc.embedJpg(buffer);
                }
            } catch {
                // ignore unsupported signature image data
            }

            if (!image) {
                return;
            }

            const target = getSignatureField(fieldName);
            if (!target?.page || !target.rect) {
                return;
            }

            // Preserve the signature's real aspect ratio instead of stretching it
            // to fill the box — scale to fit within the box, then center it.
            const boxWidth = target.rect.width;
            const boxHeight = target.rect.height;
            const imageAspectRatio = image.width / image.height;
            const boxAspectRatio = boxWidth / boxHeight;

            let drawWidth: number;
            let drawHeight: number;

            if (imageAspectRatio > boxAspectRatio) {
                // image is relatively wider than the box — constrain by width
                drawWidth = boxWidth;
                drawHeight = boxWidth / imageAspectRatio;
            } else {
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
        };
        for (const [index, signer] of buyerSigners.entries()) {
            const fieldIndex = index + 1;

            if (signer?.signedAt) {
                await drawTextOnSignatureArea(
                    `buyer_${fieldIndex}_signature_date`,
                    formatSignedDate(new Date(signer.signedAt)),
                );
            }

            if (signer?.isSigned && signer?.signatureImage) {
                await setSignatureImageOnField(`buyer_${fieldIndex}_signature`, signer.signatureImage);
            }
        }

        for (const [index, signer] of sellerSigners.entries()) {
            const fieldIndex = buyerSigners.length + index + 1;

            if (signer?.signedAt) {
                await drawTextOnSignatureArea(
                    `buyer_${fieldIndex}_signature_date`,
                    formatSignedDate(new Date(signer.signedAt)),
                );
            }

            if (signer?.isSigned && signer?.signatureImage) {
                await setSignatureImageOnField(`buyer_${fieldIndex}_signature`, signer.signatureImage);
            }
        }

        const targetIndex = signerRole === 'buyer' ? signerIndex + 1 : buyerSigners.length + signerIndex + 1;

        const targetFieldName = `buyer_${targetIndex}_signature`;
        await drawTextOnSignatureArea(`buyer_${targetIndex}_signature_date`, formatSignedDate(new Date()));
        await setSignatureImageOnField(targetFieldName, signatureImage);

        const updatedPdf = await pdfDoc.save();
        const fileName = `agreements/agreement_${agreement?._id ?? Date.now()}.pdf`;
        const updatedUrl = await uploadToS3({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName,
        });

        return updatedUrl ?? agreement.agreementMainDoc;
    } catch (error) {
        console.warn('Failed to update agreement PDF after signature, keeping original PDF:', error);
        return agreement.agreementMainDoc;
    }
};


// Fills in the buyer name(s) at the "Name:" line for each signer slot on
// page 2. Handles 1 or 2 signers — index 0 goes to slot 1, index 1 to slot 2.
// Does NOT touch signature/date fields — call this only for name placement.

// ========================================================================= buyer sign in main pdf =======================================================
export const updateSignerNamesOnPdf = async (
    agreementMainDoc: string,
    buyerAuthorizeSigner: { name: string }[],
    agreementId: string,
) => {
    if (!agreementMainDoc || !buyerAuthorizeSigner?.length) {
        return agreementMainDoc ?? null;
    }


    try {
        const response = await axios.get(agreementMainDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        // const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const page = pdfDoc.getPage(1); // page index 1 = second page, where name slots live

        // Only slots 1 and 2 exist on this template — max 2 signers, matching the schema.
        buyerAuthorizeSigner.slice(0, 2).forEach((signer, index) => {
            const slotNumber = index + 1;
            const layout = PAGE_2_SIGNER_LAYOUT[slotNumber];

            if (!layout) {
                console.warn(`No layout defined for signer name slot ${slotNumber}`);
                return;
            }

            page.drawText(String(signer.name ?? ''), {
                x: layout.name.x,
                y: layout.name.y - 4,
                size: 13,
                // font,
                color: rgb(0, 0, 0)
            });
        });

        const updatedPdf = await pdfDoc.save();
        const fileName = `agreements/agreement_${agreementId ?? Date.now()}.pdf`;
        const updatedUrl = await uploadToS3({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName,
        });

        return updatedUrl ?? agreementMainDoc;
    } catch (error) {
        console.warn('Failed to stamp buyer names onto agreement PDF, keeping original PDF:', error);
        return agreementMainDoc;
    }
};


// ========================================================================= set sign seller and buyer name in property agreement pdf=======================================================

// Offsets relative to each slot's tuned `name` y-position, derived from the
// same ~65pt (name→signature) / ~18pt (signature→date) spacing already
// proven correct in PAGE_2_SIGNER_LAYOUT. dateOffsetX pushes the date past
// the signature line's width, next to the "Date:" label on the same row.
// const SIGNATURE_ROW_OFFSET_Y = 65;
// const DATE_ROW_OFFSET_Y = 83;
const DATE_OFFSET_X = 320;

// Stamps ONE signer's signature image + signed date onto the property
// agreement's page 10, at the given role/slot position.
export const updatePropertyAgreementSignature = async (
    propertyAgreementDoc: string,
    role: PartyRole,
    slotNumber: 1 | 2,
    signatureImage: string | undefined,
    signedAt: Date,
    agreementId: string,
    countyType: string,
) => {
    if (!propertyAgreementDoc || !signatureImage) {
        return propertyAgreementDoc ?? null;
    }

    try {
        const response = await axios.get(propertyAgreementDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const { signaturePage } = PROPERTY_AGREEMENT_LAYOUT(countyType);
        const page = pdfDoc.getPages()[signaturePage.pageIndex];

        if (!page) {
            console.warn(`Property agreement has no page at index ${signaturePage.pageIndex}, skipping signature`);
            return propertyAgreementDoc;
        }

        const namePos = signaturePage[role][slotNumber];
        if (!namePos) {
            console.warn(`No signature slot defined for ${role} #${slotNumber}`);
            return propertyAgreementDoc;
        }

        const offsetTable = SIGNATURE_DATE_ROW_OFFSETS[countyType] ?? SIGNATURE_DATE_ROW_OFFSETS.OTHER;
        const offsets = offsetTable[role][slotNumber];
        const signatureY = namePos.y - offsets.signature;
        const dateY = namePos.y - offsets.date;

        const trimmedImage = String(signatureImage).trim();
        const imageData = trimmedImage.startsWith('data:image')
            ? trimmedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '')
            : trimmedImage;
        const buffer = Buffer.from(imageData, 'base64');

        let image: any = null;
        try {
            const signatureHeader = buffer.subarray(0, 8).toString('hex');
            if (signatureHeader === '89504e470d0a1a0a') {
                image = await pdfDoc.embedPng(buffer);
            } else if (signatureHeader.startsWith('ffd8')) {
                image = await pdfDoc.embedJpg(buffer);
            }
        } catch {
            // ignore unsupported signature image data
        }

        if (image) {
            const boxWidth = signaturePage.maxWidth;
            const boxHeight = 25;
            const imageAspectRatio = image.width / image.height;
            const boxAspectRatio = boxWidth / boxHeight;

            let drawWidth: number;
            let drawHeight: number;

            if (imageAspectRatio > boxAspectRatio) {
                drawWidth = boxWidth;
                drawHeight = boxWidth / imageAspectRatio;
            } else {
                drawHeight = boxHeight;
                drawWidth = boxHeight * imageAspectRatio;
            }

            const offsetX = namePos.x + (boxWidth - drawWidth) / 2;
            const offsetY = signatureY + (boxHeight - drawHeight) / 2;

            page.drawImage(image, { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight });
        }

        page.drawText(formatSignedDate(signedAt), {
            x: namePos.x + DATE_OFFSET_X,
            y: dateY,
            size: 13,
            font,
            color: rgb(0, 0, 0),
        });

        const updatedPdf = await pdfDoc.save();
        const updatedUrl = await uploadToS3({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName: `agreements/property_agreement_${agreementId ?? 'agreement'}_${Date.now()}.pdf`,
        });

        return updatedUrl ?? propertyAgreementDoc;
    } catch (error) {
        console.warn('Failed to stamp signature onto property agreement PDF, keeping original PDF:', error);
        return propertyAgreementDoc;
    }
};





// ======================================================================= set seller and buyer name in property agreement pdf=======================================================

type PartyRole = 'buyer' | 'seller';

interface IPartySigner {
    name?: string | null;
    email?: string | null;
}




const PARTY_TEXT_COLOR = rgb(0, 0, 0);

const joinSignerField = (signers: IPartySigner[], key: 'name' | 'email') =>
    signers
        .map((signer) => String(signer?.[key] ?? '').trim())
        .filter(Boolean)
        .join(', ');

// Stamps buyer OR seller details onto the property agreement:
//   page 1  -> names (comma-separated if multiple)
//   page 9  -> emails (comma-separated if multiple)
//   page 10 -> name only, signer 1 in slot 1, signer 2 in slot 2
export const updatePropertyAgreementParties = async (
    propertyAgreementDoc: string,
    role: PartyRole,
    signers: IPartySigner[],
    agreementId: string,
    countyType: string,
) => {
    if (!propertyAgreementDoc || !signers?.length) {
        return propertyAgreementDoc ?? null;
    }

    try {
        const response = await axios.get(propertyAgreementDoc, { responseType: 'arraybuffer' });
        const pdfBytes = Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        // Draws text at the given position, shrinking the font if it would
        // run past maxWidth (long names / two comma-separated values).
        const drawFitted = (
            pageIndex: number,
            text: string,
            pos: { x: number; y: number },
            maxWidth: number,
        ) => {
            const page = pages[pageIndex];
            if (!page) {
                console.warn(`Property agreement has no page at index ${pageIndex}, skipping`);
                return;
            }
            if (!text) return;

            let size = 11;
            while (size > 7 && font.widthOfTextAtSize(text, size) > maxWidth) {
                size -= 0.5;
            }

            page.drawText(text, {
                x: pos.x,
                y: pos.y,
                size,
                font,
                color: PARTY_TEXT_COLOR,
            });
        };

        const { partiesPage, emailsPage, signaturePage } = PROPERTY_AGREEMENT_LAYOUT(countyType);

        // Page 1: names
        drawFitted(
            partiesPage.pageIndex,
            joinSignerField(signers, 'name'),
            partiesPage[role],
            partiesPage.maxWidth,
        );

        // Page 9: emails
        drawFitted(
            emailsPage.pageIndex,
            joinSignerField(signers, 'email'),
            emailsPage[role],
            emailsPage.maxWidth,
        );

        // Page 10: one name per slot, max 2 signers per side
        signers.slice(0, 2).forEach((signer, index) => {
            const slot = (index + 1) as 1 | 2;
            drawFitted(
                signaturePage.pageIndex,
                String(signer?.name ?? '').trim(),
                signaturePage[role][slot],
                signaturePage.maxWidth,
            );
        });

        const updatedPdf = await pdfDoc.save();
        const updatedUrl = await uploadToS3({
            file: { buffer: updatedPdf, mimetype: 'application/pdf' },
            fileName: `agreements/property_agreement_${agreementId ?? 'agreement'}_${Date.now()}.pdf`,
        });

        return updatedUrl ?? propertyAgreementDoc;
    } catch (error) {
        console.warn('Failed to stamp parties onto property agreement PDF, keeping original PDF:', error);
        return propertyAgreementDoc;
    }
};




