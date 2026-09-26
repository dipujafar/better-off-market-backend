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
exports.contactUsService = void 0;
const mailSender_1 = require("../../utils/mailSender");
const user_constants_1 = require("../user/user.constants");
const user_models_1 = require("../user/user.models");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const contactUs = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield user_models_1.User.findOne({ role: user_constants_1.USER_ROLE.admin });
    if (!admin) {
        throw new Error('Something went wrong. Please try again.');
    }
    const contactEmailPath = path_1.default.join(__dirname, '../../../../public/view/contact_us.html');
    yield (0, mailSender_1.sendEmail)(admin === null || admin === void 0 ? void 0 : admin.email, 'Received a support email from contact us section', fs_1.default
        .readFileSync(contactEmailPath, 'utf8')
        .replace('{{userName}}', admin === null || admin === void 0 ? void 0 : admin.name)
        .replace('{{fullName}}', payload.name)
        .replace('{{email}}', payload === null || payload === void 0 ? void 0 : payload.email)
        .replace('{{subject}}', payload === null || payload === void 0 ? void 0 : payload.subject)
        .replace('{{message}}', payload === null || payload === void 0 ? void 0 : payload.message)
        .replace('{{year}}', new Date().getFullYear().toString()));
});
exports.contactUsService = {
    contactUs
};
