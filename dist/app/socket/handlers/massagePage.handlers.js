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
const user_models_1 = require("../../modules/user/user.models");
const message_model_1 = require("../../modules/message/message.model");
const serializeMessage_1 = require("../utils/serializeMessage");
const onlineUsers_1 = require("../utils/onlineUsers");
const MessagePageHandlers = (io, payload, currentUserId, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, page = 1, limit = 10 } = payload;
    if (!userId) {
        return (0, callbackFn_1.default)(callback, { success: false, message: 'userId is required' });
    }
    const skip = (page - 1) * limit;
    try {
        const receiverDetails = yield user_models_1.User.findById(userId).select('name email profile role');
        if (!receiverDetails) {
            return (0, callbackFn_1.default)(callback, { success: false, message: 'User not found!' });
        }
        const userSocket = (0, onlineUsers_1.getSocketIdByUserId)(currentUserId);
        if (!userSocket) {
            return (0, callbackFn_1.default)(callback, { success: false, message: 'User socket ID not found' });
        }
        io.to(userSocket).emit('user_details', {
            _id: receiverDetails._id,
            name: receiverDetails.name,
            email: receiverDetails.email,
            profile: receiverDetails.profile,
            role: receiverDetails.role,
        });
        const filter = {
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        };
        const [messages, totalMessages] = yield Promise.all([
            message_model_1.Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            message_model_1.Message.countDocuments(filter),
        ]);
        const serialized = messages.map(serializeMessage_1.serializeMessage).reverse();
        const response = {
            data: serialized,
            meta: {
                page,
                limit,
                total: totalMessages,
                totalPage: Math.ceil(totalMessages / limit),
                hasMore: skip + messages.length < totalMessages,
            },
        };
        io.to(userSocket).emit('message', response);
    }
    catch (error) {
        console.error('Error in message-page event:', error);
        (0, callbackFn_1.default)(callback, { success: false, message: error.message });
    }
});
exports.default = MessagePageHandlers;
