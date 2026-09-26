"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeMessage = void 0;
const serializeMessage = (msg) => {
    var _a, _b;
    return ({
        _id: msg._id.toString(),
        sender: msg.senderId.toString(),
        receiver: msg.receiverId.toString(),
        text: (_a = msg.text) !== null && _a !== void 0 ? _a : '',
        imageUrl: ((_b = msg.images) !== null && _b !== void 0 ? _b : []).map((img) => img.url),
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        seen: msg.seen,
        chat: msg.chatId.toString(),
    });
};
exports.serializeMessage = serializeMessage;
