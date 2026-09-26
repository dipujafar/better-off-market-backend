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
exports.getInTouchController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const getInTouch_service_1 = require("./getInTouch.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createGetInTouch = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_service_1.getInTouchService.createGetInTouch(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'GetInTouch created successfully',
        data: result,
    });
}));
const getAllGetInTouch = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_service_1.getInTouchService.getAllGetInTouch(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'All getInTouch fetched successfully',
        data: result,
    });
}));
const getGetInTouchById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_service_1.getInTouchService.getGetInTouchById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'GetInTouch fetched successfully',
        data: result,
    });
}));
const updateGetInTouch = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_service_1.getInTouchService.updateGetInTouch(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'GetInTouch updated successfully',
        data: result,
    });
}));
const deleteGetInTouch = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_service_1.getInTouchService.deleteGetInTouch(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'GetInTouch deleted successfully',
        data: result,
    });
}));
exports.getInTouchController = {
    createGetInTouch,
    getAllGetInTouch,
    getGetInTouchById,
    updateGetInTouch,
    deleteGetInTouch,
};
