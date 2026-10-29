"use strict";
//constants/aws.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = __importDefault(require("../config"));
exports.s3Client = new client_s3_1.S3Client({
    region: `${(_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _a === void 0 ? void 0 : _a.region}`,
    endpoint: (_b = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _b === void 0 ? void 0 : _b.s3_api,
    credentials: {
        accessKeyId: `${(_c = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _c === void 0 ? void 0 : _c.accessKeyId}`,
        secretAccessKey: `${(_d = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.aws) === null || _d === void 0 ? void 0 : _d.secretAccessKey}`,
    },
    // forcePathStyle: true,
});
