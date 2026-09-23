import { Offer } from "../offer/offer.models";
import { IAuthorizeSigner } from "./agreement.interface";
import { Agreement } from "./agreement.model";

import path from "path";
import fs from "fs";
import { sendEmail } from "../../utils/mailSender";
import config from "../../config";

export const addSellerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner) => {
    await Offer.findByIdAndUpdate(offerId, { $set: { isSellerAddedAuthorizedSigner: true } }, { new: true });

    const result = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { sellerAuthorizeSigner: payload } },
        { new: true }
    );
    return result;
}

export const addBuyerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner[]) => {
    const offer = await Offer.findByIdAndUpdate(offerId, { $set: { isBuyerAddedAuthorizedSigner: true } }, { new: true }).populate('property').populate('buyer').populate('seller');

    console.log(offer)

    const result = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { buyerAuthorizeSigner: payload } },
        { new: true }
    );

    const contactEmailPath = path.join(
        __dirname,
        '../../../../public/view/agreement.html',
    );

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
                .replace('{{propertyAddress}}', `${property?.streetAddress}, ${property?.city}, ${property?.state}, ${property?.zip}, ${property?.county}`)
                .replace('{{name}}', buyer?.name)
                .replace('{{agreementUrl}}', `${config.client_Url}/agreement/${offer?._id}?email=${signer?.email}`)
                .replace('{{year}}', new Date().getFullYear().toString()),
        );
    })




    // await sendEmail(
    //     admin?.email as string,
    //     'You assigned an authorized signer for a property agreement',
    //     fs
    //         .readFileSync(contactEmailPath, 'utf8')
    //         .replace('{{userName}}', admin?.name)
    //         .replace('{{fullName}}', payload.name)
    //         .replace('{{email}}', payload?.email)
    //         .replace('{{subject}}', payload?.subject)
    //         .replace('{{message}}', payload?.message)
    //         .replace('{{year}}', new Date().getFullYear().toString()),
    // );

    return "result";
}






export const agreementService = {
    addSellerAuthorizedSigner,
    addBuyerAuthorizedSigner
}