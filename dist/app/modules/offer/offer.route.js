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
exports.offerRoutes = void 0;
const express_1 = require("express");
const offer_controller_1 = require("./offer.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const offer_validation_1 = require("./offer.validation");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const multer_1 = __importStar(require("multer"));
const parseData_1 = __importDefault(require("../../middleware/parseData"));
const offer_upload_middleware_1 = __importDefault(require("./offer.upload.middleware"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: (0, multer_1.memoryStorage)() });
const offerUploadFields = upload.fields([
    { name: 'supportingDocuments', maxCount: 10 },
]);
const allRoles = [
    user_constants_1.USER_ROLE.user,
    user_constants_1.USER_ROLE.admin,
    user_constants_1.USER_ROLE.sub_admin,
    user_constants_1.USER_ROLE.super_admin,
];
router.post('/', (0, auth_1.default)(...allRoles), offerUploadFields, (0, parseData_1.default)(), offer_upload_middleware_1.default, (0, validateRequest_1.default)(offer_validation_1.offerValidation.createOfferValidationSchema), offer_controller_1.offerController.createOffer);
router.patch('/:id/counter', (0, auth_1.default)(...allRoles), (0, validateRequest_1.default)(offer_validation_1.offerValidation.counterOfferValidationSchema), offer_controller_1.offerController.counterOffer);
router.patch('/:id/accept', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.acceptOffer);
router.patch('/:id/reject', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.rejectOffer);
router.patch('/:id/withdraw', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.withdrawOffer);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), offer_controller_1.offerController.getAllOffers);
router.get('/my-offers', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.getMyOffers);
router.get('/received-offers', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.getReceivedOffers);
router.get('/stats', (0, auth_1.default)(user_constants_1.USER_ROLE.admin, user_constants_1.USER_ROLE.sub_admin, user_constants_1.USER_ROLE.super_admin), offer_controller_1.offerController.getOfferStats);
router.patch('/:id', (0, auth_1.default)(...allRoles), (0, validateRequest_1.default)(offer_validation_1.offerValidation.counterOfferValidationSchema), offer_controller_1.offerController.updateOffer);
router.delete('/:id', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.deleteOffer);
router.get('/:id', (0, auth_1.default)(...allRoles), offer_controller_1.offerController.getOfferById);
exports.offerRoutes = router;
