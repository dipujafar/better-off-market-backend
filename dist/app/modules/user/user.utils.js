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
exports.checkUserExit = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const checkUserExit = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    //   const isExist = await User.isUserExist(payload.phoneNumber as string);
    //   const isExistEmail = await User.isUserExistEmail(payload.email as string);
    const isExist = yield user_models_1.User.isUserExist(payload.phoneNumber, payload.email);
    if ((isExist === null || isExist === void 0 ? void 0 : isExist.phoneExists) && !((_b = (_a = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _a === void 0 ? void 0 : _a.verification) === null || _b === void 0 ? void 0 : _b.status)) {
        const { phoneNumber } = payload, updateData = __rest(payload, ["phoneNumber"]);
        updateData.password = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
        const user = yield user_models_1.User.findByIdAndUpdate((_c = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _c === void 0 ? void 0 : _c._id, updateData, {
            new: true,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user creation failed');
        }
        return user;
    }
    else if ((isExist === null || isExist === void 0 ? void 0 : isExist.emailExists) && !((_e = (_d = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _d === void 0 ? void 0 : _d.verification) === null || _e === void 0 ? void 0 : _e.status)) {
        const { email } = payload, updateData = __rest(payload, ["email"]);
        updateData.password = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, Number(config_1.default.bcrypt_salt_rounds));
        const user = yield user_models_1.User.findByIdAndUpdate((_f = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _f === void 0 ? void 0 : _f._id, updateData, {
            new: true,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user creation failed');
        }
        return user;
    }
    else if ((isExist === null || isExist === void 0 ? void 0 : isExist.emailExists) && ((_h = (_g = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _g === void 0 ? void 0 : _g.verification) === null || _h === void 0 ? void 0 : _h.status)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this email');
    }
    else if ((isExist === null || isExist === void 0 ? void 0 : isExist.phoneExists) && ((_k = (_j = isExist === null || isExist === void 0 ? void 0 : isExist.user) === null || _j === void 0 ? void 0 : _j.verification) === null || _k === void 0 ? void 0 : _k.status)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User already exists with this phone number');
    }
});
exports.checkUserExit = checkUserExit;
