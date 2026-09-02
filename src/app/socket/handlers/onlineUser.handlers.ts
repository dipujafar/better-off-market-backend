import { Server } from 'socket.io';
import { getAllOnlineUserIds } from '../utils/onlineUsers';

export const broadcastOnlineUsers = (io: Server) => {
    const userIds = getAllOnlineUserIds();
    io.emit('onlineUser', userIds); // renamed from onlineUsersList to match frontend
};