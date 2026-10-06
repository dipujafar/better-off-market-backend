import { Offer } from "../offer/offer.models";
import { IAgreement, IAuthorizeSigner } from "./agreement.interface";
import { Agreement } from "./agreement.model";
import path from "path";
import fs from "fs";
import httpStatus from "http-status";
import { sendEmail } from "../../utils/mailSender";
import config from "../../config";
import { propertyAddress } from "../properties/properties.utils";
import AppError from "../../error/AppError";
import { Property } from "../properties/properties.models";
import { IProperty } from "../properties/properties.interface";
import { STATUS } from "../properties/properties.constants";
import { User } from "../user/user.models";
import { AGREEMENT_STATUS } from "./agreement.constants";
import { updatePropertyAgreementParties, updatePropertyAgreementSignature, updateSignedAgreementPdf, updateSignerNamesOnPdf } from "./agreement.utils";


const findSignerIndexByEmail = (signers: IAuthorizeSigner[] = [], email: string) => {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    return signers.findIndex((signer) => String(signer.email ?? '').trim().toLowerCase() === normalizedEmail);
};

type CompletionEmailRecipient = { email?: string; name?: string };
type PopulatedUser = { email?: string; name?: string };

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return entities[character];
    });

const renderCompletionTemplate = (templateName: string, replacements: Record<string, string>) => {
    const templatePath = path.join(__dirname, '../../../../public/view', templateName);
    const template = fs.readFileSync(templatePath, 'utf8');

    return Object.entries(replacements).reduce(
        (html, [placeholder, value]) =>
            html.replace(new RegExp(`{{${placeholder}}}`, 'g'), escapeHtml(value)),
        template,
    );
};

const sendCompletionEmailsToRecipients = async (
    recipients: CompletionEmailRecipient[],
    subject: string,
    html: string,
) => {
    const uniqueRecipients = new Map<string, { email: string; name?: string }>();
    recipients.forEach((recipient) => {
        const email = recipient.email?.trim();
        if (email) {
            const key = email.toLowerCase();
            if (!uniqueRecipients.has(key)) {
                uniqueRecipients.set(key, { email, name: recipient.name });
            }
        }
    });

    const recipientList = Array.from(uniqueRecipients.values());
    const results = await Promise.allSettled(
        recipientList.map((recipient) =>
            sendEmail(
                recipient.email,
                subject,
                html.replace('{{userName}}', escapeHtml(recipient.name || 'there')),
            ),
        ),
    );

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            const recipient = recipientList[index];
            console.error(`Failed to send agreement completion email to ${recipient.email}:`, result.reason);
        }
    });
};

const sendAgreementCompletionEmails = async (
    agreement: Pick<
        IAgreement,
        'agreementMainDoc' | 'propertyAgreementDoc' | 'buyerAuthorizeSigner' | 'sellerAuthorizeSigner'
    >,
    property: Partial<IProperty>,
    buyer: PopulatedUser,
    seller: PopulatedUser,
) => {
    const address = propertyAddress(
        property.streetAddress,
        property.city,
        property.state,
        property.zipCode,
        property.county,
    );
    const commonReplacements = {
        propertyAddress: address,
        year: new Date().getFullYear().toString(),
    };

    const buyerHtml = renderCompletionTemplate('buyer_doc_completed.html', {
        ...commonReplacements,
        documentUrl: agreement.agreementMainDoc,
        platformdocumentUrl: agreement.propertyAgreementDoc,
    });
    const sellerHtml = renderCompletionTemplate('seller_doc_completed.html', {
        ...commonReplacements,
        documentUrl: agreement.agreementMainDoc,
    });
    const admin = await User.GetAdminUser();

    await Promise.all([
        sendCompletionEmailsToRecipients(
            [...agreement.buyerAuthorizeSigner, buyer, admin ?? {}],
            'Your Property Documents Are Complete',
            buyerHtml,
        ),
        sendCompletionEmailsToRecipients(
            [...agreement.sellerAuthorizeSigner, seller],
            'Your Property Documents Are Complete',
            sellerHtml,
        ),
    ]);
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
    const agreement = await Agreement.findOne({ offer: offerId })
        .populate('property')
        .populate('buyer')
        .populate('seller');

    if (!agreement) {
        throw new AppError(httpStatus.NOT_FOUND, 'Authorized signer not found');
    }

    const property = agreement.property as unknown as IProperty;
    const buyer = agreement.buyer as unknown as PopulatedUser;
    const seller = agreement.seller as unknown as PopulatedUser;
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
            void sendAgreementCompletionEmails(agreement, property, buyer, seller).catch((error) => {
                console.error('Failed to send agreement completion emails:', error);
            });
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
            void sendAgreementCompletionEmails(agreement, property, buyer, seller).catch((error) => {
                console.error('Failed to send agreement completion emails:', error);
            });
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