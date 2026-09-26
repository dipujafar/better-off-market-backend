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
exports.faqsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const faqs_models_1 = __importDefault(require("./faqs.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createFaqs = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield faqs_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create faqs');
    }
    return result;
});
const getAllFaqs = (query) => __awaiter(void 0, void 0, void 0, function* () {
    query["isDeleted"] = false;
    const faqsModel = new QueryBuilder_1.default(faqs_models_1.default.find(), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield faqsModel.modelQuery;
    const meta = yield faqsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getFaqsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield faqs_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Faqs not found!');
    }
    return result;
});
const updateFaqs = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield faqs_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Faqs');
    }
    return result;
});
const deleteFaqs = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield faqs_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete faqs');
    }
    return result;
});
exports.faqsService = {
    createFaqs,
    getAllFaqs,
    getFaqsById,
    updateFaqs,
    deleteFaqs,
};
