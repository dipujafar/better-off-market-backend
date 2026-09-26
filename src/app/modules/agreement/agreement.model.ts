import { model, Schema } from "mongoose";
import { IAgreement } from "./agreement.interface";
import { AGREEMENT_STATUS, AGREEMENT_STATUS_OPTIONS } from "./agreement.constants";

const authorizeSigner = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    isSigned: { type: Boolean, default: false },
    signatureImage: { type: String, default: null },
    signedAt: { type: Date, default: null },
})

const agreementSchema = new Schema<IAgreement>({
    offer: { type: Schema.Types.ObjectId, ref: 'Offer', required: true, unique: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: AGREEMENT_STATUS_OPTIONS as IAgreement['status'][],
        default: AGREEMENT_STATUS.processing as IAgreement['status'],
        required: true,
    },
    agreementMainDoc: { type: String, default: null },
    buyerAuthorizeSigner: { type: [authorizeSigner], default: [] },
    sellerAuthorizeSigner: { type: [authorizeSigner], default: [] },
    isDeleted: { type: 'boolean', default: false },
}, { timestamps: true });

export const Agreement = model<IAgreement>('Agreement', agreementSchema);
