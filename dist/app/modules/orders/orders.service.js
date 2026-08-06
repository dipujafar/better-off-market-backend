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
exports.ordersService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const orders_models_1 = __importDefault(require("./orders.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const orders_constants_1 = require("./orders.constants");
const requests_models_1 = __importDefault(require("../product-requests/requests.models"));
const s3_1 = require("../../utils/s3");
const requests_constants_1 = require("../product-requests/requests.constants");
const createOrders = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create orders');
    }
    return result;
});
const getAllOrders = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const ordersModel = new QueryBuilder_1.default(orders_models_1.default.find()
        .populate('product')
        .populate('user')
        .populate({
        path: 'payment',
        populate: {
            path: 'moneyTransferCompany',
        },
    }), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield ordersModel.modelQuery;
    const meta = yield ordersModel.countTotal();
    // ─── Statistics via aggregation pipeline ────────────────────────────
    const stats = yield orders_models_1.default.aggregate([
        { $match: { isDeleted: false } },
        {
            $facet: {
                overview: [
                    {
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                        },
                    },
                ],
                ongoing: [
                    {
                        $match: {
                            status: {
                                $in: [orders_constants_1.orderStatus.on_progress],
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            ongoingCount: { $sum: 1 },
                        },
                    },
                ],
                completed: [
                    { $match: { status: orders_constants_1.orderStatus.completed } },
                    {
                        $group: {
                            _id: null,
                            completedCount: { $sum: 1 },
                        },
                    },
                ],
                rejected: [
                    { $match: { status: orders_constants_1.orderStatus.canceled } },
                    {
                        $group: {
                            _id: null,
                            rejectedCount: { $sum: 1 },
                        },
                    },
                ],
            },
        },
        {
            $project: {
                overview: { $ifNull: [{ $arrayElemAt: ['$overview', 0] }, {}] },
                ongoing: { $ifNull: [{ $arrayElemAt: ['$ongoing', 0] }, {}] },
                completed: { $ifNull: [{ $arrayElemAt: ['$completed', 0] }, {}] },
                rejected: { $ifNull: [{ $arrayElemAt: ['$rejected', 0] }, {}] },
            },
        },
    ]);
    const s = (_a = stats[0]) !== null && _a !== void 0 ? _a : {};
    const statistics = {
        totalOrders: (_c = (_b = s.overview) === null || _b === void 0 ? void 0 : _b.totalOrders) !== null && _c !== void 0 ? _c : 0,
        ongoingOrders: (_e = (_d = s.ongoing) === null || _d === void 0 ? void 0 : _d.ongoingCount) !== null && _e !== void 0 ? _e : 0,
        completedOrders: (_g = (_f = s.completed) === null || _f === void 0 ? void 0 : _f.completedCount) !== null && _g !== void 0 ? _g : 0,
        rejectedOrders: (_j = (_h = s.rejected) === null || _h === void 0 ? void 0 : _h.rejectedCount) !== null && _j !== void 0 ? _j : 0,
    };
    return {
        data,
        meta,
        statistics,
    };
});
const getMyOrdersFromDB = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    query['isDeleted'] = false;
    query['user'] = userId;
    const ordersModel = new QueryBuilder_1.default(orders_models_1.default.find().populate('product'), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield ordersModel.modelQuery;
    const meta = yield ordersModel.countTotal();
    return {
        data,
        meta,
    };
});
const getOrdersById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_models_1.default.findById(id).populate('product');
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Orders not found!');
    }
    return result;
});
const updateOrders = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Orders');
    }
    return result;
});
const deleteOrders = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete orders');
    }
    return result;
});
//  ------------------------------------------- update orders shipping -------------------------------------------
const updateShippingStatus = (orderId, shippingStatusId, files) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // ── 1. Find the order ──────────────────────────────────────────
    const order = yield orders_models_1.default.findById(orderId);
    if (!order) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Order not found');
    }
    // ── 2. Find the shipping step inside the order ─────────────────
    const stepIndex = order.shippingStatus.findIndex((s) => s._id.toString() === shippingStatusId);
    if (stepIndex === -1) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Shipping step not found');
    }
    const step = order.shippingStatus[stepIndex];
    // ── 3. Guard: Payment 75% Received cannot be set manually ──────
    if (step.status === orders_constants_1.shippingSteps.payment_75_received) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This step is updated automatically once payment is received and accepted. You cannot change it manually.');
    }
    // ── 4. Already complete? ───────────────────────────────────────
    if (step.isComplete) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This shipping step is already marked as complete');
    }
    // ── 5. Handle each step ────────────────────────────────────────
    switch (step.status) {
        // ── Purchased in UAE ────────────────────────────────────────
        case orders_constants_1.shippingSteps.purchased_in_UAE: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            break;
        }
        // ── In Warehouse (Dubai) ────────────────────────────────────
        case orders_constants_1.shippingSteps.in_dubai_warehouse: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            order.displayStatus = orders_constants_1.orderDisplayStatus.in_warehouse;
            break;
        }
        // ── Shipped to Libya ────────────────────────────────────────
        case orders_constants_1.shippingSteps.shipped_to_libya: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            order.displayStatus = orders_constants_1.orderDisplayStatus.in_transit;
            break;
        }
        // ── In Libya Warehouse ──────────────────────────────────────
        case orders_constants_1.shippingSteps.in_libya_warehouse: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            order.displayStatus = orders_constants_1.orderDisplayStatus.in_warehouse;
            break;
        }
        // ── Arrived Item Image ──────────────────────────────────────
        case orders_constants_1.shippingSteps.arrived_item_image: {
            const uploadedFiles = files;
            if (!((_a = uploadedFiles === null || uploadedFiles === void 0 ? void 0 : uploadedFiles.arrivedImages) === null || _a === void 0 ? void 0 : _a.length)) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Arrived item images are required for this step');
            }
            // Find the linked product request
            const productRequest = yield requests_models_1.default.findById(order.product);
            if (!productRequest) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Linked product request not found');
            }
            // Upload images to S3
            const imgsArray = uploadedFiles.arrivedImages.map(file => ({
                file,
                path: `images/arrived`,
            }));
            const uploadedImages = yield (0, s3_1.uploadManyToS3)(imgsArray);
            // Push into arrivedImages on the product request
            yield requests_models_1.default.findByIdAndUpdate(productRequest._id, {
                $push: { arrivedImages: { $each: uploadedImages } },
            });
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            break;
        }
        // ── Ready To Collect ────────────────────────────────────────
        case orders_constants_1.shippingSteps.ready_to_collect: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            order.displayStatus = orders_constants_1.orderDisplayStatus.ready_to_collect;
            break;
        }
        // ── Completed ───────────────────────────────────────────────
        case orders_constants_1.shippingSteps.completed: {
            order.shippingStatus[stepIndex].isComplete = true;
            order.shippingStatus[stepIndex].updatedAt = new Date();
            // Mark order as completed
            order.status = orders_constants_1.orderStatus.completed;
            order.displayStatus = orders_constants_1.orderDisplayStatus.completed;
            // Mark the linked product request as completed
            const productRequest = yield requests_models_1.default.findById(order.product);
            if (!productRequest) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Linked product request not found');
            }
            yield requests_models_1.default.findByIdAndUpdate(productRequest._id, {
                displayStatus: requests_constants_1.displayStatus.completed,
                // If your requests schema has a `status` field with a completed value,
                // update it here too — e.g.: status: status.completed
            });
            break;
        }
        // ── Fallback (unknown / unhandled step) ─────────────────────
        default: {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `No handler defined for shipping step: ${step.status}`);
        }
    }
    // ── 6. Persist the order ───────────────────────────────────────
    const updatedOrder = yield order.save();
    return updatedOrder;
});
exports.ordersService = {
    createOrders,
    getAllOrders,
    getMyOrdersFromDB,
    getOrdersById,
    updateOrders,
    deleteOrders,
    updateShippingStatus,
};
