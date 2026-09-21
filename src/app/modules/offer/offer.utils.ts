import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { PDFDocument } from 'pdf-lib';
import { IOffer } from './offer.interface';
import { uploadToS3 } from '../../utils/s3';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const formatCurrency = (value: number | string | null | undefined): string => {
    const numericValue = Number(value ?? 0);
    if (!Number.isFinite(numericValue)) {
        return '$0';
    }

    return `${numericValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

const getDisplayName = (person: unknown): string => {
    if (!person || typeof person !== 'object') {
        return '';
    }

    const record = person as Record<string, unknown>;
    const name = record.name ?? record.fullName;
    return String(name ?? '').trim();
};

const getPropertyAddress = (property: unknown): string => {
    if (!property || typeof property !== 'object') {
        return '';
    }

    const record = property as Record<string, unknown>;
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

export const generateOfferPdf = async (offer: IOffer): Promise<string | undefined | null> => {
    try {
        const pdfPath = path.join(process.cwd(), 'offer_agreement.pdf');

        if (!fs.existsSync(pdfPath)) {
            console.error('Offer PDF template not found at:', pdfPath);
            return null;
        }

        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        const buyer = (offer as any)?.buyer ?? {};
        const seller = (offer as any)?.seller ?? {};
        const property = (offer as any)?.property ?? {};
        const terms = (offer as any)?.currentTerms ?? {};

        const setFieldText = (fieldName: string, value: string) => {
            try {
                const field = form.getTextField(fieldName);
                field.setText(value || '');
            } catch {
                // ignore missing field names in the template
            }
        };

        const buyerName = getDisplayName(buyer);
        const sellerName = getDisplayName(seller);
        const propertyAddress = getPropertyAddress(property);
        const offerAmount = Number(terms?.offerAmount ?? property?.listingPrice ?? 0);
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
        const generatedPdf = await pdfDoc.save();

        const fileName = `offers/offer_agreement_${Date.now()}.pdf`;

        try {
            const uploadedUrl = await uploadToS3({
                file: { buffer: generatedPdf, mimetype: 'application/pdf' },
                fileName,
            });

            if (uploadedUrl) {
                return uploadedUrl;
            }
        } catch (error) {
            console.warn('S3 upload failed for generated offer PDF, falling back to local file:', error);
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate offer PDF');
        }

        // const outputDir = path.join(process.cwd(), 'generated-offers');
        // fs.mkdirSync(outputDir, { recursive: true });

        // const localFilePath = path.join(outputDir, fileName.replace(/\//g, '_'));
        // fs.writeFileSync(localFilePath, generatedPdf);

        // return localFilePath;

    } catch (error) {
        console.error('Error generating offer PDF:', error);
        return null;
    }
};