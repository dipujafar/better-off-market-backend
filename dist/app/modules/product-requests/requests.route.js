"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestsRoutes = void 0;
const express_1 = require("express");
const requests_controller_1 = require("./requests.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const requests_validation_1 = require("./requests.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const multer_1 = __importStar(require("multer"));
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: (0, multer_1.memoryStorage)() });
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), (0, validateRequest_1.default)(requests_validation_1.requestValidation.requestSchema), requests_controller_1.requestsController.createRequests);
router.patch('/resend-quotation/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), upload.single('image'), (0, parseData_1.default)(), (0, validateRequest_1.default)(requests_validation_1.requestValidation.reSendQuotationSchema), requests_controller_1.requestsController.updateRequestForResendQuotation);
router.patch('/reject-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), requests_controller_1.requestsController.rejectRequests);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(requests_validation_1.requestValidation.updateRequestSchema), requests_controller_1.requestsController.updateRequests);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), requests_controller_1.requestsController.deleteRequests);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), requests_controller_1.requestsController.getAllRequests);
router.get('/my-requests', (0, auth_1.default)(user_constants_1.USER_ROLE.user), requests_controller_1.requestsController.getMyProductRequests);
router.get('/received-quotations', (0, auth_1.default)(user_constants_1.USER_ROLE.user), requests_controller_1.requestsController.getMyReceivedQuotations);
router.get('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.user), requests_controller_1.requestsController.getRequestsById);
exports.requestsRoutes = router;
