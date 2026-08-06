"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneyTransferCompanyRoutes = void 0;
const express_1 = require("express");
const moneyTransferCompany_controller_1 = require("./moneyTransferCompany.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const moneyTransferCompany_validation_1 = require("./moneyTransferCompany.validation");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(moneyTransferCompany_validation_1.MoneyTransferCompanyValidation.createMoneyTransferCompanyValidationSchema), moneyTransferCompany_controller_1.moneyTransferCompanyController.createMoneyTransferCompany);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(moneyTransferCompany_validation_1.MoneyTransferCompanyValidation.updateMoneyTransferCompanyValidationSchema), moneyTransferCompany_controller_1.moneyTransferCompanyController.updateMoneyTransferCompany);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), moneyTransferCompany_controller_1.moneyTransferCompanyController.deleteMoneyTransferCompany);
router.get('/:id', moneyTransferCompany_controller_1.moneyTransferCompanyController.getMoneyTransferCompanyById);
router.get('/', moneyTransferCompany_controller_1.moneyTransferCompanyController.getAllMoneyTransferCompany);
exports.moneyTransferCompanyRoutes = router;
