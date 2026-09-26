"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = require("express");
const contactUs_controller_1 = require("./contactUs.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const contactUs_validation_1 = require("./contactUs.validation");
const router = (0, express_1.Router)();
router.post("/", (0, validateRequest_1.default)(contactUs_validation_1.contactUsValidation.sendContactUsValidation), contactUs_controller_1.contactUsController.contactUs);
exports.contactRouter = router;
