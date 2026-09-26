import { Offer } from "../offer/offer.models";
import { IAuthorizeSigner } from "./agreement.interface";
import { Agreement } from "./agreement.model";

import path from "path";
import fs from "fs";
import axios from "axios";
import httpStatus from "http-status";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sendEmail } from "../../utils/mailSender";
import config from "../../config";
import { propertyAddress } from "../properties/properties.utils";
import AppError from "../../error/AppError";
import { Property } from "../properties/properties.models";
import { STATUS } from "../properties/properties.constants";
import { uploadToS3 } from "../../utils/s3";
import { AGREEMENT_STATUS } from "./agreement.constants";
import { updateSignedAgreementPdf, updateSignerNamesOnPdf } from "./agreement.utils";


const findSignerIndexByEmail = (signers: IAuthorizeSigner[] = [], email: string) => {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    return signers.findIndex((signer) => String(signer.email ?? '').trim().toLowerCase() === normalizedEmail);
};


export const addSellerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner[]) => {
    const offer = await Offer.findByIdAndUpdate(offerId, { $set: { isSellerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');

    const result = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { sellerAuthorizeSigner: payload } },
        { new: true }
    );

    const contactEmailPath = path.join(
        __dirname,
        '../../../../public/view/agreement.html',
    );

    const seller: any = offer?.seller;
    const property: any = offer?.property;

    payload.forEach(async (signer) => {
        await sendEmail(
            signer.email,
            'You have been added as an authorized signer for a property agreement',
            fs
                .readFileSync(contactEmailPath, 'utf8')
                .replace('{{userName}}', signer.name)
                .replace('{{name}}', seller?.name)
                .replace('{{propertyAddress}}', propertyAddress(property?.streetAddress, property?.city, property?.state, property?.zip, property?.county))
                .replace('{{name}}', seller?.name)
                .replace('{{agreementUrl}}', `${config.client_Url}/agreement/${offer?._id}?email=${signer?.email}&user=seller`)
                .replace('{{year}}', new Date().getFullYear().toString()),
        );
    })


    return result;
}

export const addBuyerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner[]) => {
    const offer = await Offer.findByIdAndUpdate(
        offerId,
        { $set: { isBuyerAddedAuthorizedSigner: true } },
        { new: true },
    )
        .populate('property')
        .populate('buyer')
        .populate('seller');

    let agreement = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { buyerAuthorizeSigner: payload } },
        { new: true },
    );

    // Stamp the buyer name(s) into the correct slot(s) on the PDF now that the
    // full signer list for this agreement is known.
    if (agreement) {
        const updatedPdfUrl = await updateSignerNamesOnPdf(
            agreement.agreementMainDoc,
            agreement.buyerAuthorizeSigner,
            agreement._id.toString(),
        );

        agreement = await Agreement.findOneAndUpdate(
            { offer: offerId },
            { agreementMainDoc: updatedPdfUrl },
            { new: true },
        );
    }

    const contactEmailPath = path.join(__dirname, '../../../../public/view/agreement.html');

    const buyer: any = offer?.buyer;
    const property: any = offer?.property;

    payload.forEach(async (signer) => {
        await sendEmail(
            signer.email,
            'You have been added as an authorized signer for a property agreement',
            fs
                .readFileSync(contactEmailPath, 'utf8')
                .replace('{{userName}}', signer.name)
                .replace('{{name}}', buyer?.name)
                .replace(
                    '{{propertyAddress}}',
                    propertyAddress(property?.streetAddress, property?.city, property?.state, property?.zip, property?.county),
                )
                .replace('{{name}}', buyer?.name)
                .replace('{{agreementUrl}}', `${config.client_Url}/agreement/${offer?._id}?email=${signer?.email}&user=buyer`)
                .replace('{{year}}', new Date().getFullYear().toString()),
        );
    });

    return agreement;
};

export const signAgreement = async (
    offerId: string,
    payload: { email: string; signatureImage?: string },
) => {
    const agreement = await Agreement.findOne({ offer: offerId });

    if (!agreement) {
        throw new AppError(httpStatus.NOT_FOUND, 'Authorized signer not found');
    }

    // Buyer-only: only search the buyer's authorized signer list.
    const buyerIndex = findSignerIndexByEmail(agreement.buyerAuthorizeSigner ?? [], payload.email);

    if (buyerIndex < 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'Buyer Authorized signer not found');
    }

    const signerRole: 'buyer' = 'buyer';
    const signerIndex = buyerIndex;

    // Mutate the real subdocument directly — this correctly reads/writes through
    // its schema-defined getters/setters instead of trying to spread it.
    const signerSubdoc = agreement.buyerAuthorizeSigner[signerIndex];

    if (signerSubdoc.isSigned) {
        throw new AppError(httpStatus.BAD_REQUEST, 'You have already signed');
    }

    signerSubdoc.isSigned = true;
    signerSubdoc.signatureImage = payload.signatureImage ?? signerSubdoc.signatureImage ?? '';
    signerSubdoc.signedAt = new Date();

    // Belt-and-suspenders: ensures Mongoose marks the array as changed even in
    // edge cases where nested subdocument mutation isn't auto-detected.
    agreement.markModified('buyerAuthorizeSigner');

    const sellerAuthorizeSigner = agreement.sellerAuthorizeSigner ?? [];

    const areAllBuyerSignersSigned = agreement.buyerAuthorizeSigner.length
        ? agreement.buyerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;

    const areAllSellerSignersSigned = sellerAuthorizeSigner.length
        ? sellerAuthorizeSigner.every((signer) => signer.isSigned)
        : true;

    const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;

    // @ts-ignore
    agreement.status = shouldCompleteAgreement ? AGREEMENT_STATUS.completed : agreement.status;

    agreement.agreementMainDoc = await updateSignedAgreementPdf(
        agreement.toObject(), // safe here — toObject() correctly resolves all schema fields to plain values
        signerRole,
        signerIndex,
        payload.signatureImage,
    );

    await agreement.save();

    if (shouldCompleteAgreement) {
        await Property.findByIdAndUpdate(agreement.property, { status: STATUS.sold }, { new: true });
    }

    return agreement;
};
export const getAgreements = async (offerId: string) => {
    const result = await Agreement.findOne({ offer: offerId });
    return result;
}

export const getAgreementByOfferId = async (offerId: string) => {
    const result = await Agreement.findOne({ offer: offerId });
    return result;
}



export const agreementService = {
    addSellerAuthorizedSigner,
    addBuyerAuthorizedSigner,
    signAgreement,
    getAgreements,
    getAgreementByOfferId
}