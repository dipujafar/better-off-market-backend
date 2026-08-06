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
const orders_constants_1 = require("./orders.constants");
const shippingStepSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: {
            values: orders_constants_1.SHIPPING_STEPS,
            message: `{VALUE} is not a valid status. Accepted values: ${orders_constants_1.SHIPPING_STEPS.join(', ')}`,
        },
        required: true,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    updatedAt: {
        type: Date,
    },
});
const ordersSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Requests',
        required: true,
    },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shippingStatus: {
        type: [shippingStepSchema],
        required: true,
        default: () => orders_constants_1.SHIPPING_STEPS.map(step => ({
            status: step,
            isComplete: step === orders_constants_1.shippingSteps.payment_receive,
            updatedAt: step === orders_constants_1.shippingSteps.payment_receive ? new Date() : undefined,
        })),
    },
    status: {
        type: String,
        enum: {
            values: orders_constants_1.ORDER_STATUS,
            message: `{VALUE} is not a valid status. Accepted values: ${orders_constants_1.ORDER_STATUS.join(', ')}`,
        },
        default: orders_constants_1.orderStatus.on_progress,
    },
    displayStatus: {
        type: String,
        enum: {
            values: orders_constants_1.ORDER_DISPLAY_STATUS,
            message: `{VALUE} is not a valid status. Accepted values: ${orders_constants_1.ORDER_DISPLAY_STATUS.join(', ')}`,
        },
        default: orders_constants_1.orderDisplayStatus.on_progress,
        required: true,
    },
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// --------------------------- set virtuals to pass  payment related information in order data ---------------------------
ordersSchema.virtual('needToPay').get(function () {
    if (this.product &&
        typeof this.product === 'object' &&
        'needToPay' in this.product) {
        return this.product.needToPay;
    }
    return null;
});
ordersSchema.virtual('needToPayPercent').get(function () {
    if (this.product &&
        typeof this.product === 'object' &&
        'needToPayPercent' in this.product) {
        return this.product.needToPayPercent;
    }
    return null;
});
ordersSchema.virtual('totalPaid').get(function () {
    if (this.product &&
        typeof this.product === 'object' &&
        'needToPay' in this.product) {
        return this.product.totalPaid;
    }
    return null;
});
ordersSchema.pre('find', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
ordersSchema.pre('findOne', function (next) {
    this.where({ isDeleted: { $ne: true } });
    next();
});
ordersSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
ordersSchema.statics.isOrderExists = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield this.findById(id);
        return order;
    });
};
const Orders = (0, mongoose_1.model)('Orders', ordersSchema);
exports.default = Orders;
