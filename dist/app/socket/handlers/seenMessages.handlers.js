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
const chat_model_1 = require("../../modules/chat/chat.model");
const message_model_1 = require("../../modules/message/message.model");
const chatList_handlers_1 = __importDefault(require("./chatList.handlers"));
const SeenMessageHandlers = (io, chatId, user, callback) => __awaiter(void 0, void 0, void 0, function* () {
    if (!chatId) {
        return (0, callbackFn_1.default)(callback, { success: false, message: 'chatId is required' });
    }
    try {
        const chat = yield chat_model_1.Chat.findById(chatId);
        if (!chat) {
            return (0, callbackFn_1.default)(callback, { success: false, message: 'chat not found' });
        }
        yield message_model_1.Message.updateMany({ chatId: chat._id, receiverId: user.userId, seen: false }, { $set: { seen: true } });
        const [user1, user2] = chat.participants;
        if (user1) {
            yield (0, chatList_handlers_1.default)(io, { userId: user1.toString() }, { page: 1, limit: 10 }, () => { });
        }
        if (user2) {
            yield (0, chatList_handlers_1.default)(io, { userId: user2.toString() }, { page: 1, limit: 10 }, () => { });
        }
        (0, callbackFn_1.default)(callback, { success: true, message: 'Messages marked as seen' });
    }
    catch (error) {
        // console.log(error);
        (0, callbackFn_1.default)(callback, { success: false, message: (error === null || error === void 0 ? void 0 : error.message) || 'seen message failed' });
    }
});
exports.default = SeenMessageHandlers;
