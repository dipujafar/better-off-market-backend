"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRoutes = void 0;
const express_1 = require("express");
const reports_controller_1 = require("./reports.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const reports_validation_1 = require("./reports.validation");
const user_constants_1 = require("../user/user.constants");
const auth_1 = __importDefault(require("../../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), (0, validateRequest_1.default)(reports_validation_1.reportValidation.createReportValidationSchema), reports_controller_1.reportsController.createReports);
router.patch('/:id', reports_controller_1.reportsController.updateReports);
router.delete('/:id', reports_controller_1.reportsController.deleteReports);
router.get('/:id', reports_controller_1.reportsController.getReportsById);
router.get('/', reports_controller_1.reportsController.getAllReports);
exports.reportsRoutes = router;
