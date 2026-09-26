"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastOnlineUsers = void 0;
const onlineUsers_1 = require("../utils/onlineUsers");
const broadcastOnlineUsers = (io) => {
    const userIds = (0, onlineUsers_1.getAllOnlineUserIds)();
    io.emit('onlineUser', userIds); // renamed from onlineUsersList to match frontend
};
exports.broadcastOnlineUsers = broadcastOnlineUsers;
