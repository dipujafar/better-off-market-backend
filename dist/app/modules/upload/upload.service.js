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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
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
const uploadFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const uploaded = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        const url = yield (0, s3_1.uploadToS3)({
            file,
            fileName: `chat/${Date.now()}-${sanitizeFileName(file.originalname)}`,
        });
        return { url };
    })));
    return uploaded;
});
exports.uploadService = { uploadFiles };
