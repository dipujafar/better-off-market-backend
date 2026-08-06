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
exports.ordersController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const orders_service_1 = require("./orders.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.createOrders(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Orders created successfully',
        data: result,
    });
}));
const getAllOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.getAllOrders(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All orders fetched successfully',
        data: result,
    });
}));
const getMyOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.getMyOrdersFromDB(req.query, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'My orders fetched successfully',
        data: result,
    });
}));
const getOrdersById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.getOrdersById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Orders fetched successfully',
        data: result,
    });
}));
const updateOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.updateOrders(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Orders updated successfully',
        data: result,
    });
}));
const deleteOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield orders_service_1.ordersService.deleteOrders(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Orders deleted successfully',
        data: result,
    });
}));
// ---------------------------------------------------------------------- update order status -------------
const updateShippingStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const { shippingStatusId } = req.body;
    const result = yield orders_service_1.ordersService.updateShippingStatus(orderId, shippingStatusId, req.files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Shipping status updated successfully',
        data: result,
    });
}));
exports.ordersController = {
    createOrders,
    getAllOrders,
    getMyOrders,
    getOrdersById,
    updateOrders,
    deleteOrders,
    updateShippingStatus,
};
