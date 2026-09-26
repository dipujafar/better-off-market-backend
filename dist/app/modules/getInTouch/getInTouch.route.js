"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInTouchRoutes = void 0;
const express_1 = require("express");
const getInTouch_controller_1 = require("./getInTouch.controller");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const getInTouch_validation_1 = require("./getInTouch.validation");
const router = (0, express_1.Router)();
router.post('/', (0, validateRequest_1.default)(getInTouch_validation_1.getInTouchValidation.createGetInTouch), getInTouch_controller_1.getInTouchController.createGetInTouch);
router.patch('/:id', getInTouch_controller_1.getInTouchController.updateGetInTouch);
router.delete('/:id', getInTouch_controller_1.getInTouchController.deleteGetInTouch);
router.get('/:id', getInTouch_controller_1.getInTouchController.getGetInTouchById);
router.get('/', getInTouch_controller_1.getInTouchController.getAllGetInTouch);
exports.getInTouchRoutes = router;
