
const userIdToSocketId = new Map<string, string>();
const socketIdToUserId = new Map<string, string>();

export const setUserSocket = (userId: string, socketId: string) => {
    userIdToSocketId.set(userId, socketId);
    socketIdToUserId.set(socketId, userId);
};

export const removeUserSocket = (userId: string, socketId: string) => {
    userIdToSocketId.delete(userId);
    socketIdToUserId.delete(socketId);
};

export const getSocketIdByUserId = (userId: string) =>
    userIdToSocketId.get(userId);

export const getUserIdBySocketId = (socketId: string) =>
    socketIdToUserId.get(socketId);

export const getAllOnlineUserIds = () => Array.from(userIdToSocketId.keys());