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
const requests_constants_1 = require("./requests.constants");
const arrivedSchema = new mongoose_1.Schema({
    key: { type: 'string', required: [true, 'Image key is required'] },
    url: {
        type: 'string',
        required: [true, 'Image URL is required'],
        match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
    }, // URL validation
});
const requestsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: 'string', default: null },
    productLink: { type: 'string', required: true },
    title: { type: 'string', default: null },
    price: { type: 'number', default: null },
    size: { type: 'string', default: null },
    color: { type: 'string', default: null },
    quantity: { type: 'number', default: null },
    totalPrice: { type: 'number', default: null },
    needToPay: { type: 'number', default: null },
    needToPayPercent: { type: 'number', default: null },
    totalPaid: { type: 'number', default: 0 },
    status: {
        type: 'string',
        enum: {
            values: requests_constants_1.statusEnum,
            message: `{VALUE} is not a valid status. Accepted values: ${requests_constants_1.statusEnum.join(', ')}`,
        },
        required: true,
        default: requests_constants_1.status.request,
    },
    displayStatus: {
        type: String,
        enum: {
            values: requests_constants_1.DISPLAY_STATUS,
            message: `{VALUE} is not a valid status. Accepted values: ${requests_constants_1.DISPLAY_STATUS.join(', ')}`,
        },
        default: requests_constants_1.displayStatus.requested,
        required: true,
    },
    arrivedImages: [arrivedSchema],
    isDeleted: { type: 'boolean', default: false },
}, {
    timestamps: true,
});
requestsSchema.pre('find', function (next) {
    this.where({ isDeleted: false });
    next();
});
requestsSchema.pre('findOne', function (next) {
    this.where({ isDeleted: false });
    next();
});
requestsSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: false } });
    next();
});
requestsSchema.statics.isRequestsDeleted = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Requests.findById(id);
        return result === null || result === void 0 ? void 0 : result.isDeleted;
    });
};
requestsSchema.statics.isRequestExists = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Requests.findById(id);
    });
};
const Requests = (0, mongoose_1.model)('Requests', requestsSchema);
exports.default = Requests;
