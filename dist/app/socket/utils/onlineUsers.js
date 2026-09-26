"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOnlineUserIds = exports.getUserIdBySocketId = exports.getSocketIdByUserId = exports.removeUserSocket = exports.setUserSocket = void 0;
const userIdToSocketId = new Map();
const socketIdToUserId = new Map();
const setUserSocket = (userId, socketId) => {
    userIdToSocketId.set(userId, socketId);
    socketIdToUserId.set(socketId, userId);
};
exports.setUserSocket = setUserSocket;
const removeUserSocket = (userId, socketId) => {
    userIdToSocketId.delete(userId);
    socketIdToUserId.delete(socketId);
};
exports.removeUserSocket = removeUserSocket;
const getSocketIdByUserId = (userId) => userIdToSocketId.get(userId);
exports.getSocketIdByUserId = getSocketIdByUserId;
const getUserIdBySocketId = (socketId) => socketIdToUserId.get(socketId);
exports.getUserIdBySocketId = getUserIdBySocketId;
const getAllOnlineUserIds = () => Array.from(userIdToSocketId.keys());
exports.getAllOnlineUserIds = getAllOnlineUserIds;
