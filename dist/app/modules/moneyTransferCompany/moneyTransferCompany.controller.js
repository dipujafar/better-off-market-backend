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
exports.moneyTransferCompanyController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const moneyTransferCompany_service_1 = require("./moneyTransferCompany.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createMoneyTransferCompany = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_service_1.moneyTransferCompanyService.createMoneyTransferCompany(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'MoneyTransferCompany created successfully',
        data: result,
    });
}));
const getAllMoneyTransferCompany = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_service_1.moneyTransferCompanyService.getAllMoneyTransferCompany(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All moneyTransferCompany fetched successfully',
        data: result,
    });
}));
const getMoneyTransferCompanyById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_service_1.moneyTransferCompanyService.getMoneyTransferCompanyById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'MoneyTransferCompany fetched successfully',
        data: result,
    });
}));
const updateMoneyTransferCompany = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_service_1.moneyTransferCompanyService.updateMoneyTransferCompany(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'MoneyTransferCompany updated successfully',
        data: result,
    });
}));
const deleteMoneyTransferCompany = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_service_1.moneyTransferCompanyService.deleteMoneyTransferCompany(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'MoneyTransferCompany deleted successfully',
        data: result,
    });
}));
exports.moneyTransferCompanyController = {
    createMoneyTransferCompany,
    getAllMoneyTransferCompany,
    getMoneyTransferCompanyById,
    updateMoneyTransferCompany,
    deleteMoneyTransferCompany,
};
