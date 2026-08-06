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
exports.requestsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const requests_service_1 = require("./requests.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const s3_1 = require("../../utils/s3");
// --------------------------------------------- create product request ------------------------------------------------
const createRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body.user = req.user.userId;
    const result = yield requests_service_1.requestsService.createRequests(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Requests sent successfully',
        data: {
            _id: result === null || result === void 0 ? void 0 : result._id,
            productLink: result === null || result === void 0 ? void 0 : result.productLink,
        },
    });
}));
// --------------------------------------------- update product request for resend quotation ------------------------------------------------
const updateRequestForResendQuotation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (req.file) {
        req.body.image = yield (0, s3_1.uploadToS3)({
            file: req.file,
            fileName: `product/image/${Math.floor(100000 + Math.random() * 900000)}`,
        });
    }
    const result = yield requests_service_1.requestsService.updateRequestsForResendQuotation(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Send quotation successfully for this request',
        data: result,
    });
}));
// --------------------------------------------- get all product requests ------------------------------------------------
const getAllRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.getAllRequests(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All product requests fetched successfully',
        data: result,
    });
}));
const getRequestsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.getRequestsById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: ' Requests fetched successfully',
        data: result,
    });
}));
// --------------------------------------------- get my product requests ------------------------------------------------
const getMyProductRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.getMyProductRequests(req.query, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'My product order requests fetched successfully',
        data: result,
    });
}));
// --------------------------------------------- get my received quotations ------------------------------------------------
const getMyReceivedQuotations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.getMyReceivedQuotation(req.query, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'My product order requests fetched successfully',
        data: result,
    });
}));
// --------------------------------------------- update product request ------------------------------------------------
const updateRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.updateRequest(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Requests updated successfully',
        data: result,
    });
}));
// --------------------------------------------- reject product request ------------------------------------------------
const rejectRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.rejectRequests(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Requests rejected successfully',
        data: result,
    });
}));
// --------------------------------------------- delete product request ------------------------------------------------
const deleteRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_service_1.requestsService.deleteRequests(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Requests deleted successfully',
        data: result,
    });
}));
exports.requestsController = {
    createRequests,
    updateRequestForResendQuotation,
    getMyReceivedQuotations,
    getAllRequests,
    getRequestsById,
    getMyProductRequests,
    updateRequests,
    rejectRequests,
    deleteRequests,
};
