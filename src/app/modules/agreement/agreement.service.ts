import { Offer } from "../offer/offer.models";
import { IAuthorizeSigner } from "./agreement.interface";
import { Agreement } from "./agreement.model";
import path from "path";
import fs from "fs";
import httpStatus from "http-status";
import { sendEmail } from "../../utils/mailSender";
import config from "../../config";
import { propertyAddress } from "../properties/properties.utils";
import AppError from "../../error/AppError";
import { Property } from "../properties/properties.models";
import { STATUS } from "../properties/properties.constants";
import { AGREEMENT_STATUS } from "./agreement.constants";
import { updatePropertyAgreementParties, updatePropertyAgreementSignature, updateSignedAgreementPdf, updateSignerNamesOnPdf } from "./agreement.utils";


const findSignerIndexByEmail = (signers: IAuthorizeSigner[] = [], email: string) => {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    return signers.findIndex((signer) => String(signer.email ?? '').trim().toLowerCase() === normalizedEmail);
};


export const addSellerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner[]) => {
    const offer = await Offer.findByIdAndUpdate(
        offerId,
        { $set: { isSellerAddedAuthorizedSigner: true } },
        { new: true },
    ).populate('property').populate('buyer').populate('seller');

    let agreement = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { sellerAuthorizeSigner: payload } },
        { new: true },
    );

    const property: any = offer?.property;

    if (agreement) {
        const propertyDocUrl = await updatePropertyAgreementParties(
            agreement.propertyAgreementDoc,
            'seller',
            agreement.sellerAuthorizeSigner,
            agreement._id.toString(),
            property?.countyType ?? '',
        );

        agreement = await Agreement.findOneAndUpdate(
            { offer: offerId },
            { propertyAgreementDoc: propertyDocUrl },
            { new: true },
        );
    }

    const contactEmailPath = path.join(
        __dirname,
        '../../../../public/view/agreement.html',
    );

    const seller: any = offer?.seller;


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


    return agreement;
}

export const addBuyerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner[]) => {
    const offer = await Offer.findByIdAndUpdate(
        offerId,
        { $set: { isBuyerAddedAuthorizedSigner: true } },
        { new: true },
    ).populate('property').populate('buyer').populate('seller');

    const property: any = offer?.property;

    let agreement = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { buyerAuthorizeSigner: payload } },
        { new: true },
    );

    if (agreement) {
        // two independent PDFs, so stamp them in parallel
        const [mainDocUrl, propertyDocUrl] = await Promise.all([
            updateSignerNamesOnPdf(
                agreement.agreementMainDoc,
                agreement.buyerAuthorizeSigner,
                agreement._id.toString(),
            ),
            updatePropertyAgreementParties(
                agreement.propertyAgreementDoc,
                'buyer',
                agreement.buyerAuthorizeSigner,
                agreement._id.toString(),
                property?.countyType ?? '',
            ),
        ]);

        agreement = await Agreement.findOneAndUpdate(
            { offer: offerId },
            { agreementMainDoc: mainDocUrl, propertyAgreementDoc: propertyDocUrl },
            { new: true },
        );
    }

    const contactEmailPath = path.join(__dirname, '../../../../public/view/agreement.html');

    const buyer: any = offer?.buyer;


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


export const signDocument = async (
    offerId: string,
    payload: { email: string; signatureImage?: string; role: 'buyer' | 'seller' },
) => {
    const agreement = await Agreement.findOne({ offer: offerId }).populate('property');

    if (!agreement) {
        throw new AppError(httpStatus.NOT_FOUND, 'Authorized signer not found');
    }

    const property: any = agreement.property;
    // Assumption: distinguishing the two document layouts by the property's
    // state — adjust this if countyType is actually stored elsewhere.
    const countyType = property?.state?.toUpperCase() === 'OHIO' ? 'OHIO' : 'OTHER';

    if (payload.role === 'buyer') {
        const buyerIndex = findSignerIndexByEmail(agreement.buyerAuthorizeSigner ?? [], payload.email);

        if (buyerIndex < 0) {
            throw new AppError(httpStatus.NOT_FOUND, 'Buyer Authorized signer not found');
        }

        const signerSubdoc = agreement.buyerAuthorizeSigner[buyerIndex];

        if (signerSubdoc.isSigned) {
            throw new AppError(httpStatus.BAD_REQUEST, 'You have already signed');
        }

        const signedAt = new Date();
        signerSubdoc.isSigned = true;
        signerSubdoc.signatureImage = payload.signatureImage ?? signerSubdoc.signatureImage ?? '';
        signerSubdoc.signedAt = signedAt;
        agreement.markModified('buyerAuthorizeSigner');

        const sellerAuthorizeSigner = agreement.sellerAuthorizeSigner ?? [];

        const areAllBuyerSignersSigned = agreement.buyerAuthorizeSigner.length
            ? agreement.buyerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;

        const areAllSellerSignersSigned = sellerAuthorizeSigner.length
            ? sellerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;

        const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;

        // existing behavior: stamp the main doc
        agreement.agreementMainDoc = await updateSignedAgreementPdf(
            agreement.toObject(),
            'buyer',
            buyerIndex,
            payload.signatureImage,
        );

        // additionally: stamp the buyer's signature/date onto the property
        // agreement's page 10, buyer slot
        agreement.propertyAgreementDoc = await updatePropertyAgreementSignature(
            agreement.propertyAgreementDoc,
            'buyer',
            (buyerIndex + 1) as 1 | 2,
            payload.signatureImage,
            signedAt,
            agreement._id.toString(),
            countyType,
        );

        // @ts-ignore
        agreement.status = shouldCompleteAgreement ? AGREEMENT_STATUS.completed : agreement.status;

        await agreement.save();

        if (shouldCompleteAgreement) {
            await Property.findByIdAndUpdate(agreement.property, { status: STATUS.sold }, { new: true });
            


        }

        return agreement;
    }

    if (payload.role === 'seller') {
        const sellerIndex = findSignerIndexByEmail(agreement.sellerAuthorizeSigner ?? [], payload.email);

        if (sellerIndex < 0) {
            throw new AppError(httpStatus.NOT_FOUND, 'Seller Authorized signer not found');
        }

        const signerSubdoc = agreement.sellerAuthorizeSigner[sellerIndex];

        if (signerSubdoc.isSigned) {
            throw new AppError(httpStatus.BAD_REQUEST, 'You have already signed');
        }

        const signedAt = new Date();
        signerSubdoc.isSigned = true;
        signerSubdoc.signatureImage = payload.signatureImage ?? signerSubdoc.signatureImage ?? '';
        signerSubdoc.signedAt = signedAt;
        agreement.markModified('sellerAuthorizeSigner');

        const buyerAuthorizeSigner = agreement.buyerAuthorizeSigner ?? [];

        const areAllBuyerSignersSigned = buyerAuthorizeSigner.length
            ? buyerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;

        const areAllSellerSignersSigned = agreement.sellerAuthorizeSigner.length
            ? agreement.sellerAuthorizeSigner.every((signer) => signer.isSigned)
            : false;

        const shouldCompleteAgreement = areAllBuyerSignersSigned && areAllSellerSignersSigned;

        // seller never touches agreementMainDoc — only the property agreement doc
        agreement.propertyAgreementDoc = await updatePropertyAgreementSignature(
            agreement.propertyAgreementDoc,
            'seller',
            (sellerIndex + 1) as 1 | 2,
            payload.signatureImage,
            signedAt,
            agreement._id.toString(),
            countyType,
        );

        // @ts-ignore
        agreement.status = shouldCompleteAgreement ? AGREEMENT_STATUS.completed : agreement.status;

        await agreement.save();

        if (shouldCompleteAgreement) {
            await Property.findByIdAndUpdate(agreement.property, { status: STATUS.sold }, { new: true });
        }

        return agreement;
    }

    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid signer role');
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
    signDocument,
    getAgreements,
    getAgreementByOfferId
}