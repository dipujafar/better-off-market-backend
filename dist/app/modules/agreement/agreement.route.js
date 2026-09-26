"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agreementRoute = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const agreement_controller_1 = require("./agreement.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const agreement_validation_1 = require("./agreement.validation");
const router = (0, express_1.Router)();
router.patch("/seller-authorize/:id", (0, validateRequest_1.default)(agreement_validation_1.agreementValidation.addAuthorizedSignerValidation), (0, auth_1.default)(user_constants_1.USER_ROLE.user), agreement_controller_1.agreementController.addSellerAuthorizedSigner);
router.patch("/buyer-authorize/:id", (0, validateRequest_1.default)(agreement_validation_1.agreementValidation.addAuthorizedSignerValidation), (0, auth_1.default)(user_constants_1.USER_ROLE.user), agreement_controller_1.agreementController.addBuyerAuthorizedSigner);
router.patch("/:id/sign", (0, validateRequest_1.default)(agreement_validation_1.agreementValidation.signAgreementValidation), agreement_controller_1.agreementController.signAgreement);
router.get("/", (0, auth_1.default)(user_constants_1.USER_ROLE.user), agreement_controller_1.agreementController.getAgreements);
router.get("/:id", agreement_controller_1.agreementController.getAgreementByOfferId);
exports.agreementRoute = router;
