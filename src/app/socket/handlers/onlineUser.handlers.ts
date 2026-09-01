import { Server } from 'socket.io';
import { getAllOnlineUserIds } from '../utils/onlineUsers';

export const getOnlineUserIds = (io: Server) => {
    const userIds = getAllOnlineUserIds();
    io.emit('onlineUsersList', userIds);
};