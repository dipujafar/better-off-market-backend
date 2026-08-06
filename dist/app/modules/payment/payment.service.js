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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const payment_models_1 = __importDefault(require("./payment.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const requests_constants_1 = require("../product-requests/requests.constants");
const requests_models_1 = __importDefault(require("../product-requests/requests.models"));
const payment_constants_1 = require("./payment.constants");
const orders_models_1 = __importDefault(require("../orders/orders.models"));
const mongoose_1 = __importDefault(require("mongoose"));
const orders_constants_1 = require("../orders/orders.constants");
const createInitialPaymentIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { productRequest } = payload;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const isExists = yield requests_models_1.default.findById(productRequest).session(session);
        if (!isExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product Request not found');
        }
        if ((isExists === null || isExists === void 0 ? void 0 : isExists.displayStatus) === requests_constants_1.displayStatus.payment_request) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already sent initial payment request. Please wait for admin approval');
        }
        const updateRequest = yield requests_models_1.default.findByIdAndUpdate(productRequest, { displayStatus: requests_constants_1.displayStatus.payment_request }, { new: true, session });
        if (!updateRequest) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to receive payment request! Please try again');
        }
        payload['amount'] = isExists === null || isExists === void 0 ? void 0 : isExists.needToPay;
        payload['paymentPercent'] = isExists === null || isExists === void 0 ? void 0 : isExists.needToPayPercent;
        const [result] = yield payment_models_1.default.create([payload], { session });
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create payment request');
        }
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const createSecondPaymentInitIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { order } = payload;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const isOrderExists = yield orders_models_1.default.findById(order).session(session);
        if (!isOrderExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Order not found');
        }
        if ((isOrderExists === null || isOrderExists === void 0 ? void 0 : isOrderExists.displayStatus) === orders_constants_1.orderDisplayStatus.payment_request) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already sent 75% payment request. Please wait for admin approval');
        }
        const updateRequest = yield orders_models_1.default.findByIdAndUpdate(order, {
            displayStatus: orders_constants_1.orderDisplayStatus.payment_request,
        }, { new: true, session });
        if (!updateRequest) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to receive payment request! Please try again');
        }
        const isRequestExists = yield requests_models_1.default.findById(isOrderExists === null || isOrderExists === void 0 ? void 0 : isOrderExists.product).session(session);
        if (!isRequestExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product Request not found');
        }
        payload['amount'] = isRequestExists === null || isRequestExists === void 0 ? void 0 : isRequestExists.needToPay;
        payload['paymentPercent'] = isRequestExists === null || isRequestExists === void 0 ? void 0 : isRequestExists.needToPayPercent;
        const [result] = yield payment_models_1.default.create([payload], { session });
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create payment request');
        }
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// ------------------------------------------ accept payment ------------------------------------------
const acceptPaymentIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const payment = (yield payment_models_1.default.isPaymentExists(id));
        // statistics validation
        if (!payment || (payment === null || payment === void 0 ? void 0 : payment.isDeleted)) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
        }
        // already accepted check
        if (payment.status === payment_constants_1.paymentStatus.accepted) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment already accepted');
        }
        const isRequestExists = yield requests_models_1.default.isRequestExists(payment.productRequest);
        const isOrderExists = yield orders_models_1.default.isOrderExists(payment.order);
        if (!isRequestExists && !isOrderExists) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to accept payment');
        }
        if (isRequestExists) {
            const getNeedToPay = (isRequestExists === null || isRequestExists === void 0 ? void 0 : isRequestExists.totalPrice) * 0.75;
            const currentPay = getNeedToPay - (isRequestExists === null || isRequestExists === void 0 ? void 0 : isRequestExists.needToPay);
            const updateRequestData = {
                status: requests_constants_1.status.accepted,
                displayStatus: requests_constants_1.displayStatus.on_progress,
                needToPay: currentPay,
                needToPayPercent: 75,
                totalPaid: isRequestExists === null || isRequestExists === void 0 ? void 0 : isRequestExists.needToPay,
            };
            // update request
            const updateProductRequest = yield requests_models_1.default.findByIdAndUpdate(payment.productRequest, updateRequestData, {
                new: true,
                session,
            });
            if (!updateProductRequest) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update product request');
            }
            // create order
            const order = yield orders_models_1.default.create([
                {
                    product: payment.productRequest,
                    payment: payment._id,
                    user: updateProductRequest.user,
                },
            ], { session });
            // update payment
            const result = yield payment_models_1.default.findByIdAndUpdate(id, {
                order: order[0]._id,
                status: payment_constants_1.paymentStatus.accepted,
            }, {
                new: true,
                session,
            });
            if (!result) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to accept payment');
            }
            yield session.commitTransaction();
            yield session.endSession();
            return result;
        }
        if (isOrderExists && !isRequestExists) {
            // Mark "Payment 75% Received" shipping step as complete
            yield orders_models_1.default.findByIdAndUpdate(payment.order, {
                displayStatus: orders_constants_1.orderDisplayStatus.in_warehouse,
                $set: {
                    'shippingStatus.$[step].isComplete': true,
                    'shippingStatus.$[step].updatedAt': new Date(),
                },
            }, {
                arrayFilters: [{ 'step.status': orders_constants_1.shippingSteps.payment_75_received }],
                new: true,
                session,
            });
            const productRequest = yield requests_models_1.default.isRequestExists(isOrderExists === null || isOrderExists === void 0 ? void 0 : isOrderExists.product);
            const getNeedToPay = productRequest === null || productRequest === void 0 ? void 0 : productRequest.totalPrice;
            const currentPay = getNeedToPay - (productRequest === null || productRequest === void 0 ? void 0 : productRequest.needToPay);
            const updateRequestData = {
                needToPay: currentPay,
                needToPayPercent: 100,
                totalPaid: (productRequest === null || productRequest === void 0 ? void 0 : productRequest.totalPrice) * 0.75,
            };
            // update request
            const updateProductRequest = yield requests_models_1.default.findByIdAndUpdate(productRequest._id, updateRequestData, {
                new: true,
                session,
            });
            if (!updateProductRequest) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update product data');
            }
            const result = yield payment_models_1.default.findByIdAndUpdate(id, {
                status: payment_constants_1.paymentStatus.accepted,
            }, {
                new: true,
                session,
            });
            if (!result) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to accept payment');
            }
            yield session.commitTransaction();
            yield session.endSession();
            return result;
        }
        yield session.commitTransaction();
        yield session.endSession();
        return payment;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
// ------------------------------------------ reject payment ------------------------------------------
const rejectPaymentIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const payment = (yield payment_models_1.default.isPaymentExists(id));
        if (!payment || (payment === null || payment === void 0 ? void 0 : payment.isDeleted)) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Payment not found');
        }
        if (payment.status === payment_constants_1.paymentStatus.rejected) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment already rejected');
        }
        if (payment.productRequest) {
            // update request
            const updateRequest = yield requests_models_1.default.findByIdAndUpdate(payment.productRequest, {
                displayStatus: requests_constants_1.displayStatus.reject_payment_request,
            }, {
                new: true,
                session,
            });
            if (!updateRequest) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update request status');
            }
        }
        if (!payment.productRequest && payment.order) {
            // update order
            const updateOrder = yield orders_models_1.default.findByIdAndUpdate(payment.order, {
                displayStatus: orders_constants_1.orderDisplayStatus.reject_payment_request,
            }, {
                new: true,
                session,
            });
            if (!updateOrder) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update order');
            }
        }
        // update payment
        const result = yield payment_models_1.default.findByIdAndUpdate(id, {
            status: payment_constants_1.paymentStatus.rejected,
        }, {
            new: true,
            session,
        });
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to reject payment');
        }
        yield session.commitTransaction();
        yield session.endSession();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
// ------------------------------------------ get all payment ------------------------------------------
// payment.service.ts
const getAllPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    query['isDeleted'] = false;
    const paymentModel = new QueryBuilder_1.default(payment_models_1.default.find()
        .populate({
        path: 'order',
        populate: {
            path: 'product',
        },
    })
        .populate({
        path: 'order',
        populate: {
            path: 'user',
        },
    })
        .populate('moneyTransferCompany'), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield paymentModel.modelQuery;
    const meta = yield paymentModel.countTotal();
    // ─── Statistics via aggregation pipeline ────────────────────────────
    const stats = yield payment_models_1.default.aggregate([
        { $match: { isDeleted: false } },
        {
            $facet: {
                // Overall totals
                overview: [
                    {
                        $group: {
                            _id: null,
                            totalRequests: { $sum: 1 },
                            totalAmount: { $sum: '$amount' },
                        },
                    },
                ],
                // Accepted payments → "revenue" + "funding"
                accepted: [
                    { $match: { status: 'accepted' } },
                    {
                        $group: {
                            _id: null,
                            acceptedCount: { $sum: 1 },
                            totalRevenue: { $sum: '$amount' },
                            totalFunding: { $sum: '$amount' }, // same pool; rename if semantics differ
                        },
                    },
                ],
                // Pending / request payments
                pending: [
                    { $match: { status: 'request' } },
                    {
                        $group: {
                            _id: null,
                            pendingCount: { $sum: 1 },
                            pendingAmount: { $sum: '$amount' },
                        },
                    },
                ],
                // Rejected payments
                rejected: [
                    { $match: { status: 'rejected' } },
                    {
                        $group: {
                            _id: null,
                            rejectedCount: { $sum: 1 },
                            rejectedAmount: { $sum: '$amount' },
                        },
                    },
                ],
            },
        },
        // Flatten each facet array to a single object (or sensible default)
        {
            $project: {
                overview: { $ifNull: [{ $arrayElemAt: ['$overview', 0] }, {}] },
                accepted: { $ifNull: [{ $arrayElemAt: ['$accepted', 0] }, {}] },
                pending: { $ifNull: [{ $arrayElemAt: ['$pending', 0] }, {}] },
                rejected: { $ifNull: [{ $arrayElemAt: ['$rejected', 0] }, {}] },
            },
        },
    ]);
    const s = (_a = stats[0]) !== null && _a !== void 0 ? _a : {};
    const statistics = {
        totalRequests: {
            count: (_c = (_b = s.overview) === null || _b === void 0 ? void 0 : _b.totalRequests) !== null && _c !== void 0 ? _c : 0,
            amount: (_e = (_d = s.overview) === null || _d === void 0 ? void 0 : _d.totalAmount) !== null && _e !== void 0 ? _e : 0,
        },
        totalRevenue: {
            // accepted
            count: (_g = (_f = s.accepted) === null || _f === void 0 ? void 0 : _f.acceptedCount) !== null && _g !== void 0 ? _g : 0,
            amount: (_j = (_h = s.accepted) === null || _h === void 0 ? void 0 : _h.totalRevenue) !== null && _j !== void 0 ? _j : 0,
        },
        totalFundingMoney: {
            // request (pending)
            count: (_l = (_k = s.pending) === null || _k === void 0 ? void 0 : _k.pendingCount) !== null && _l !== void 0 ? _l : 0,
            amount: (_o = (_m = s.pending) === null || _m === void 0 ? void 0 : _m.pendingAmount) !== null && _o !== void 0 ? _o : 0,
        },
        rejected: {
            count: (_q = (_p = s.rejected) === null || _p === void 0 ? void 0 : _p.rejectedCount) !== null && _q !== void 0 ? _q : 0,
            amount: (_s = (_r = s.rejected) === null || _r === void 0 ? void 0 : _r.rejectedAmount) !== null && _s !== void 0 ? _s : 0,
        },
    };
    return {
        data,
        meta,
        statistics,
    };
});
const getPaymentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Payment not found!');
    }
    return result;
});
const updatePayment = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Payment');
    }
    return result;
});
const deletePayment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete payment');
    }
    return result;
});
exports.paymentService = {
    createInitialPaymentIntoDB,
    createSecondPaymentInitIntoDB,
    acceptPaymentIntoDB,
    rejectPaymentIntoDB,
    getAllPayment,
    getPaymentById,
    updatePayment,
    deletePayment,
};
