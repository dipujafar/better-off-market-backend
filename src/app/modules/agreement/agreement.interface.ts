import { ObjectId } from "mongoose";
import { AGREEMENT_STATUS } from "./agreement.constants";


export interface IAuthorizeSigner {
    name: string,
    email: string,
    isSigned: boolean
}

export interface IAgreement {
    _id: string;
    offer: ObjectId;
    property: ObjectId;
    buyer: ObjectId;
    seller: ObjectId;
    status: keyof typeof AGREEMENT_STATUS;
    agreementMainDoc: string;
    buyerAuthorizeSigner: IAuthorizeSigner[];
    sellerAuthorizeSigner: IAuthorizeSigner[];
    isDeleted: boolean;
}