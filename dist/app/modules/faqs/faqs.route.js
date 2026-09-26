"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqsRoutes = void 0;
const express_1 = require("express");
const faqs_controller_1 = require("./faqs.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const faqs_validation_1 = require("./faqs.validation");
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(faqs_validation_1.faqsValidation.createFaqsValidationSchema), faqs_controller_1.faqsController.createFaqs);
router.patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), (0, validateRequest_1.default)(faqs_validation_1.faqsValidation.updateFaqsValidationSchema), faqs_controller_1.faqsController.updateFaqs);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), faqs_controller_1.faqsController.deleteFaqs);
router.get('/:id', faqs_controller_1.faqsController.getFaqsById);
router.get('/', faqs_controller_1.faqsController.getAllFaqs);
exports.faqsRoutes = router;
