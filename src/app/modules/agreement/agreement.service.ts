import { IAuthorizeSigner } from "./agreement.interface";
import { Agreement } from "./agreement.model";

export const addSellerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner) => {
    const result = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { sellerAuthorizeSigner: payload } },
        { new: true }
    );
    return result;
}

export const addBuyerAuthorizedSigner = async (offerId: string, payload: IAuthorizeSigner) => {
    const result = await Agreement.findOneAndUpdate(
        { offer: offerId },
        { $push: { buyerAuthorizeSigner: payload } },
        { new: true }
    );
    return result;
}


export const agreementService = {
    addSellerAuthorizedSigner,
    addBuyerAuthorizedSigner
}