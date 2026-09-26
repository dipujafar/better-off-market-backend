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
exports.reviewsService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reviews_models_1 = __importDefault(require("./reviews.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const mongoose_1 = require("mongoose");
const createReviews = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create reviews');
    }
    return result;
});
const getAllReviews = (query) => __awaiter(void 0, void 0, void 0, function* () {
    query["isDeleted"] = false;
    const reviewsModel = new QueryBuilder_1.default(reviews_models_1.default.find(), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield reviewsModel.modelQuery;
    const meta = yield reviewsModel.countTotal();
    return {
        data,
        meta,
    };
});
const getReviewsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Reviews not found!');
    }
    return result;
});
const getAllReviewsBySeller = (sellerId, query) => __awaiter(void 0, void 0, void 0, function* () {
    query['isDeleted'] = false;
    const reviewsModel = new QueryBuilder_1.default(reviews_models_1.default.find({ seller: sellerId }).populate('user'), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield reviewsModel.modelQuery;
    const meta = yield reviewsModel.countTotal();
    const ratingAgg = yield reviews_models_1.default.aggregate([
        {
            $match: {
                seller: new mongoose_1.Types.ObjectId(sellerId),
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 },
            },
        },
    ]);
    const countMap = {};
    let totalReviews = 0;
    let ratingSum = 0;
    for (const r of ratingAgg) {
        countMap[r._id] = r.count;
        totalReviews += r.count;
        ratingSum += r._id * r.count;
    }
    const avgRating = totalReviews
        ? Number((ratingSum / totalReviews).toFixed(1))
        : 0;
    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: countMap[star] || 0,
    }));
    return {
        data,
        meta,
        summary: {
            avgRating,
            totalReviews,
            ratingBreakdown,
        },
    };
});
const updateReviews = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Reviews');
    }
    return result;
});
const deleteReviews = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reviews_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete reviews');
    }
    return result;
});
exports.reviewsService = {
    createReviews,
    getAllReviews,
    getReviewsById,
    getAllReviewsBySeller,
    updateReviews,
    deleteReviews,
};
