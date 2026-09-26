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
exports.favoriteService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const favorite_models_1 = __importDefault(require("./favorite.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const properties_models_1 = require("../properties/properties.models");
const createFavorite = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favorite_models_1.default.create(payload);
    properties_models_1.Property.findByIdAndUpdate(result === null || result === void 0 ? void 0 : result.property, {
        $inc: { totalSaved: 1 },
    }).catch((err) => {
        console.error('Failed to increment favoriteCount:', err);
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create favorite');
    }
    return result;
});
const getAllFavorite = (query) => __awaiter(void 0, void 0, void 0, function* () {
    query["isDeleted"] = false;
    const favoriteModel = new QueryBuilder_1.default(favorite_models_1.default.find().populate('property'), query)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield favoriteModel.modelQuery;
    const meta = yield favoriteModel.countTotal();
    return {
        data,
        meta,
    };
});
const getFavoriteById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favorite_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('Favorite not found!');
    }
    return result;
});
const updateFavorite = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favorite_models_1.default.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new Error('Failed to update Favorite');
    }
    return result;
});
const deleteFavorite = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield favorite_models_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete favorite');
    }
    properties_models_1.Property.findByIdAndUpdate(result.property, {
        $inc: { totalSaved: -1 },
    }).catch((err) => {
        console.error('Failed to decrement favoriteCount:', err);
    });
    return result;
});
exports.favoriteService = {
    createFavorite,
    getAllFavorite,
    getFavoriteById,
    updateFavorite,
    deleteFavorite,
};
