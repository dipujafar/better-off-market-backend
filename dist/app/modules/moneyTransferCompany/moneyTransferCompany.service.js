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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyTransferCompanyService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const moneyTransferCompany_models_1 = __importDefault(require("./moneyTransferCompany.models"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const createMoneyTransferCompany = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_models_1.default.create(payload);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create moneyTransferCompany');
    }
    return result;
});
const getAllMoneyTransferCompany = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    query['isDeleted'] = false;
    const { lat, lng } = query, restQuery = __rest(query, ["lat", "lng"]);
    if (lat && lng) {
        // Extract pagination params from restQuery
        const page = parseInt(restQuery.page) || 1;
        const limit = parseInt(restQuery.limit) || 10;
        const skip = (page - 1) * limit;
        const aggregationPipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    distanceField: 'distance', // adds distance (in meters) to each result
                    spherical: true,
                    query: { isDeleted: false }, // filter inside $geoNear
                },
            },
            { $skip: skip },
            { $limit: limit },
        ];
        const data = yield moneyTransferCompany_models_1.default.aggregate(aggregationPipeline);
        // Count total for meta
        const countPipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    distanceField: 'distance',
                    spherical: true,
                    query: { isDeleted: false },
                },
            },
            { $count: 'total' },
        ];
        const countResult = yield moneyTransferCompany_models_1.default.aggregate(countPipeline);
        const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const meta = {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        };
        return { data, meta };
    }
    // Normal flow without geo sorting
    const baseQuery = moneyTransferCompany_models_1.default.find();
    const moneyTransferCompanyModel = new QueryBuilder_1.default(baseQuery, restQuery)
        .search([])
        .filter()
        .paginate()
        .sort()
        .fields();
    const data = yield moneyTransferCompanyModel.modelQuery;
    const meta = yield moneyTransferCompanyModel.countTotal();
    return { data, meta };
});
const getMoneyTransferCompanyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_models_1.default.findById(id);
    if (!result || (result === null || result === void 0 ? void 0 : result.isDeleted)) {
        throw new Error('MoneyTransferCompany not found!');
    }
    return result;
});
const updateMoneyTransferCompany = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_models_1.default.findByIdAndUpdate(id, payload, {
        new: true,
    });
    if (!result) {
        throw new Error('Failed to update MoneyTransferCompany');
    }
    return result;
});
const deleteMoneyTransferCompany = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield moneyTransferCompany_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete moneyTransferCompany');
    }
    return result;
});
exports.moneyTransferCompanyService = {
    createMoneyTransferCompany,
    getAllMoneyTransferCompany,
    getMoneyTransferCompanyById,
    updateMoneyTransferCompany,
    deleteMoneyTransferCompany,
};
