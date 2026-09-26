"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRoutes = void 0;
const express_1 = require("express");
const stats_controller_1 = require("./stats.controller");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const router = (0, express_1.Router)();
router.get('/about-page', stats_controller_1.statsController.getPlatformStats);
router.get('/user-overview', (0, auth_1.default)(user_constants_1.USER_ROLE.admin), stats_controller_1.statsController.getUserOverview);
exports.statsRoutes = router;
