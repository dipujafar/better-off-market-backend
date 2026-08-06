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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const payment_constants_1 = require("./payment.constants");
const paymentSchema = new mongoose_1.Schema({
    amount: { type: 'number', required: true },
    paymentPercent: { type: 'number', required: true },
    productRequest: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Requests',
        default: null,
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Orders',
        default: null,
    },
    moneyTransferCompany: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MoneyTransferCompany',
        required: true,
    },
    status: {
        type: 'string',
        enum: {
            values: payment_constants_1.paymentStatusEnum,
            message: `{VALUE} is not a valid status. Accepted values: ${payment_constants_1.paymentStatusEnum.join(', ')}`,
        },
        required: true,
        default: payment_constants_1.paymentStatus.request,
    },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
paymentSchema.pre('find', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
paymentSchema.pre('findOne', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
paymentSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
paymentSchema.statics.isPaymentExists = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Payment.findById(id);
        return result;
    });
};
const Payment = (0, mongoose_1.model)('Payment', paymentSchema);
exports.default = Payment;
