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
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const s3_1 = require("../../utils/s3");
const sanitizeFileName = (name) => {
    const lastDot = name.lastIndexOf('.');
    const base = lastDot > 0 ? name.slice(0, lastDot) : name;
    const ext = lastDot > 0 ? name.slice(lastDot) : '';
    const cleanBase = base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${cleanBase}${ext}`;
};
const formatFileSize = (bytes) => {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const processOfferFiles = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const files = req.files;
    if ((_a = files === null || files === void 0 ? void 0 : files.supportingDocuments) === null || _a === void 0 ? void 0 : _a.length) {
        req.body.supportingDocuments = yield Promise.all(files.supportingDocuments.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const url = yield (0, s3_1.uploadToS3)({
                file,
                fileName: `support-documents/offer/${Date.now()}-${sanitizeFileName(file.originalname)}`,
            });
            return {
                name: file.originalname,
                size: formatFileSize(file.size),
                updated: new Date().toISOString(),
                url,
            };
        })));
    }
    next();
}));
exports.default = processOfferFiles;
