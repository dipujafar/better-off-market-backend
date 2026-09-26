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
exports.getInTouchService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const getInTouch_models_1 = __importDefault(require("./getInTouch.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createGetInTouch = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isEmailExist = yield getInTouch_models_1.default.isEmailExist(payload.email);
    if (isEmailExist) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Get notified feature already subscribed with this email');
    }
    const result = yield getInTouch_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create getInTouch');
    }
    return result;
});
const getAllGetInTouch = (query) => __awaiter(void 0, void 0, void 0, function* () {
    query["isDeleted"] = false;
    const getInTouchModel = new QueryBuilder_1.default(getInTouch_models_1.default.find(), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield getInTouchModel.modelQuery;
    const meta = yield getInTouchModel.countTotal();
    return {
        data,
        meta,
    };
});
const getGetInTouchById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('GetInTouch not found!');
    }
    return result;
});
const updateGetInTouch = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update GetInTouch');
    }
    return result;
});
const deleteGetInTouch = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield getInTouch_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete getInTouch');
    }
    return result;
});
exports.getInTouchService = {
    createGetInTouch,
    getAllGetInTouch,
    getGetInTouchById,
    updateGetInTouch,
    deleteGetInTouch,
};
