"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteRoutes = void 0;
const express_1 = require("express");
const favorite_controller_1 = require("./favorite.controller");
const user_constants_1 = require("../user/user.constants");
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const favorite_validation_1 = require("./favorite.validation");
const router = (0, express_1.Router)();
router.post('/', (0, validateRequest_1.default)(favorite_validation_1.favoriteValidation.guestValidationSchema), (0, auth_1.default)(user_constants_1.USER_ROLE.user), favorite_controller_1.favoriteController.createFavorite);
router.patch('/:id', favorite_controller_1.favoriteController.updateFavorite);
router.delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.user), favorite_controller_1.favoriteController.deleteFavorite);
router.get('/:id', favorite_controller_1.favoriteController.getFavoriteById);
router.get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.user), favorite_controller_1.favoriteController.getAllFavorite);
exports.favoriteRoutes = router;
