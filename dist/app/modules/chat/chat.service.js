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
exports.chatService = void 0;
const chat_model_1 = require("./chat.model");
const message_model_1 = require("../message/message.model");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const getAllConversations = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const chatQuery = new QueryBuilder_1.default(chat_model_1.Chat.find().populate('participants', 'name profile'), query)
        .paginate()
        .sort()
        .fields();
    const chats = yield chatQuery.modelQuery;
    const meta = yield chatQuery.countTotal();
    const chatIds = chats.map((c) => c._id);
    const messageStats = yield message_model_1.Message.aggregate([
        { $match: { chatId: { $in: chatIds } } },
        {
            $group: {
                _id: '$chatId',
                messageCount: { $sum: 1 },
                lastActivity: { $max: '$createdAt' },
            },
        },
    ]);
    const statsMap = new Map(messageStats.map((s) => [s._id.toString(), s]));
    const data = chats.map((chat) => {
        var _a, _b;
        const stats = statsMap.get(chat._id.toString());
        const [partyA, partyB] = chat.participants;
        return {
            id: chat._id.toString(),
            partyA: partyA ? { id: partyA._id.toString(), name: partyA.name, profile: (_a = partyA.profile) !== null && _a !== void 0 ? _a : null } : null,
            partyB: partyB ? { id: partyB._id.toString(), name: partyB.name, profile: (_b = partyB.profile) !== null && _b !== void 0 ? _b : null } : null,
            messageCount: (stats === null || stats === void 0 ? void 0 : stats.messageCount) || 0,
            lastActivity: (stats === null || stats === void 0 ? void 0 : stats.lastActivity) || chat.createdAt,
        };
    });
    return { data, meta };
});
const getConversationById = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chat = yield chat_model_1.Chat.findById(chatId).populate('participants', 'name profile');
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Conversation not found');
    }
    const messages = yield message_model_1.Message.find({ chatId }).sort({ createdAt: 1 });
    const [partyA, partyB] = chat.participants;
    return {
        contact: {
            id: chat._id.toString(),
            partyA: partyA ? { id: partyA._id.toString(), name: partyA.name, profile: (_a = partyA.profile) !== null && _a !== void 0 ? _a : null } : null,
            partyB: partyB ? { id: partyB._id.toString(), name: partyB.name, profile: (_b = partyB.profile) !== null && _b !== void 0 ? _b : null } : null,
        },
        messages: messages.map((m) => {
            var _a, _b;
            return ({
                id: m._id.toString(),
                sender: m.senderId.toString(),
                receiver: m.receiverId.toString(),
                text: (_a = m.text) !== null && _a !== void 0 ? _a : '',
                images: ((_b = m.images) !== null && _b !== void 0 ? _b : []).map((img) => img.url), // included whenever present
                seen: m.seen,
                createdAt: m.createdAt,
            });
        }),
    };
});
exports.chatService = { getAllConversations, getConversationById };
