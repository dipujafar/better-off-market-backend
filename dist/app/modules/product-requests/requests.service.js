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
exports.requestsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const requests_models_1 = __importDefault(require("./requests.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const requests_constants_1 = require("./requests.constants");
const createRequests = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create requests');
    }
    return result;
});
// ------------------------------------------ update the product for resend quotation ------------------------------------------
const updateRequestsForResendQuotation = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield requests_models_1.default.isRequestExists(id);
    if (!isExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product Request not found');
    }
    // @ts-ignore
    if (isExists === null || isExists === void 0 ? void 0 : isExists.isDeleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product Request is deleted');
    }
    payload['status'] = requests_constants_1.status.quotation;
    payload['displayStatus'] = requests_constants_1.displayStatus.received_quotation;
    const totalPrice = payload['price'] * payload['quantity'];
    const needToPay = totalPrice * 0.25;
    payload['totalPrice'] = totalPrice;
    payload['needToPay'] = needToPay;
    payload['needToPayPercent'] = 25;
    const result = yield requests_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Requests');
    }
    return result;
});
// ------------------------------------------ get all requests ------------------------------------------
const getAllRequests = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const requestsModel = new QueryBuilder_1.default(requests_models_1.default.find().populate('user'), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const [data, meta, stats] = yield Promise.all([
        requestsModel.modelQuery,
        requestsModel.countTotal(),
        requests_models_1.default.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);
    const statsMap = stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});
    const stateDate = {
        totalRequest: Object.values(statsMap).reduce((a, b) => a + b, 0),
        order: statsMap[requests_constants_1.status.accepted] || 0,
        sendQuotation: statsMap[requests_constants_1.status.quotation] || 0,
        rejected: statsMap[requests_constants_1.status.rejected] || 0,
    };
    return {
        stateDate,
        data,
        meta,
    };
});
// ------------------------------------------ get requests by id ------------------------------------------
const getRequestsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Requests not found!');
    }
    return result;
});
// ------------------------------------------ get my product requests ------------------------------------------
const getMyProductRequests = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    query['user'] = userId;
    query['fields'] =
        query['fields'] || 'productLink,displayStatus,createdAt,updatedAt';
    const requestsModel = new QueryBuilder_1.default(requests_models_1.default.find(), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield requestsModel.modelQuery;
    const meta = yield requestsModel.countTotal();
    return {
        data,
        meta,
    };
});
// ------------------------------------------ get quotation received ------------------------------------------
const getMyReceivedQuotation = (query, userId) => __awaiter(void 0, void 0, void 0, function* () {
    query['user'] = userId;
    query['status'] = requests_constants_1.status.quotation;
    const requestsModel = new QueryBuilder_1.default(requests_models_1.default.find(), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield requestsModel.modelQuery;
    const meta = yield requestsModel.countTotal();
    return {
        data,
        meta,
    };
});
// ------------------------------------------ update requests ------------------------------------------
const updateRequest = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requests_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Requests');
    }
    return result;
});
// ------------------------------------------ reject requests ------------------------------------------
const rejectRequests = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = (yield requests_models_1.default.isRequestExists(id));
    if (!isExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product Request not found');
    }
    console.log(isExists);
    if ((isExists === null || isExists === void 0 ? void 0 : isExists.status) !== requests_constants_1.status.request) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You can not reject this request in this stage');
    }
    const result = yield requests_models_1.default.findByIdAndUpdate(id, { status: requests_constants_1.status.rejected, displayStatus: requests_constants_1.displayStatus.rejected }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to reject requests');
    }
    return result;
});
// ------------------------------------------ delete requests ------------------------------------------
const deleteRequests = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isDeleted = yield requests_models_1.default.isRequestsDeleted(id);
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Requests already deleted');
    }
    const result = yield requests_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete requests');
    }
    return result;
});
exports.requestsService = {
    createRequests,
    updateRequestsForResendQuotation,
    getMyReceivedQuotation,
    getMyProductRequests,
    getAllRequests,
    getRequestsById,
    updateRequest,
    rejectRequests,
    deleteRequests,
};
