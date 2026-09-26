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
const socket_io_1 = require("socket.io");
const auth_socket_1 = require("./middleware/auth.socket");
const onlineUser_handlers_1 = require("./handlers/onlineUser.handlers");
const massagePage_handlers_1 = __importDefault(require("./handlers/massagePage.handlers"));
const chatList_handlers_1 = __importDefault(require("./handlers/chatList.handlers"));
const seenMessages_handlers_1 = __importDefault(require("./handlers/seenMessages.handlers"));
const sendMessage_handlers_1 = __importDefault(require("./handlers/sendMessage.handlers"));
const getReceiverId_1 = __importDefault(require("./services/getReceiverId"));
const onlineUsers_1 = require("./utils/onlineUsers");
const handleTyping = (io, socket, chatId, isTyping) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = yield (0, getReceiverId_1.default)(chatId, socket.data.userId);
    if (!receiverId)
        return;
    const receiverSocketId = (0, onlineUsers_1.getSocketIdByUserId)(receiverId);
    if (!receiverSocketId)
        return;
    // namespaced per-chat, matches frontend's `typing::${chatId}` listener
    io.to(receiverSocketId).emit(`typing::${chatId}`, {
        userId: socket.data.userId,
        isTyping,
    });
});
const initializeSocket = (server) => __awaiter(void 0, void 0, void 0, function* () {
    const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
    io.use(auth_socket_1.socketAuthMiddleware);
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            console.warn(`Socket ${socket.id} connected without userId — disconnecting`);
            socket.disconnect();
            return;
        }
        // console.log(`✅ Connected: userId=${userId} socketId=${socket.id}`);
        (0, onlineUsers_1.setUserSocket)(userId, socket.id);
        (0, onlineUser_handlers_1.broadcastOnlineUsers)(io); // auto-broadcast — frontend never asks explicitly
        socket.on('message_page', (payload, callback) => (0, massagePage_handlers_1.default)(io, payload, userId, callback));
        socket.on('my_chat_list', (payload, callback) => (0, chatList_handlers_1.default)(io, socket.data, payload, callback));
        socket.on('seen', ({ chatId }, callback) => (0, seenMessages_handlers_1.default)(io, chatId, socket.data, callback));
        socket.on('send_message', (payload, callback) => (0, sendMessage_handlers_1.default)(io, payload, socket.data, callback));
        // single unified event, matches frontend's { chatId, isTyping } payload
        socket.on('typing', ({ chatId, isTyping }) => handleTyping(io, socket, chatId, isTyping).catch((err) => console.error('typing error:', err)));
        socket.on('disconnect', () => {
            const uid = (0, onlineUsers_1.getUserIdBySocketId)(socket.id);
            if (uid) {
                (0, onlineUsers_1.removeUserSocket)(uid, socket.id);
                (0, onlineUser_handlers_1.broadcastOnlineUsers)(io); // also update everyone when someone goes offline
                // console.log(`❌ Disconnected: userId=${uid} socketId=${socket.id}`);
            }
        });
    }));
    return io;
});
exports.default = initializeSocket;
