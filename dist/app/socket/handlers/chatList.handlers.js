"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const callbackFn_1 = __importDefault(require("../utils/callbackFn"));
const getChatList_1 = require("../services/getChatList");
const onlineUsers_1 = require("../utils/onlineUsers");
const getChatList = (io_1, user_1, ...args_1) => __awaiter(void 0, [io_1, user_1, ...args_1], void 0, function* (io, user, payload = {}, callback) {
    const { page = 1, limit = 10 } = payload;
    try {
        const chatList = yield (0, getChatList_1.getMyChatList)(user.userId, page, limit);
        const userSocketId = (0, onlineUsers_1.getSocketIdByUserId)(user.userId);
        if (userSocketId) {
            io.to(userSocketId).emit('chat_list', chatList);
        }
        (0, callbackFn_1.default)(callback, {
            success: true,
            message: 'Chat list fetched successfully',
            data: chatList,
        });
    }
    catch (error) {
        (0, callbackFn_1.default)(callback, { success: false, message: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.default = getChatList;
