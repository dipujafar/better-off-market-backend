import { Server } from 'socket.io';
import callbackFn from '../utils/callbackFn';
import { getMyChatList } from '../services/getChatList';
import { getSocketIdByUserId } from '../utils/onlineUsers';

const getChatList = async (
    io: Server,
    user: { userId: string },
    payload: { limit?: number; page?: number } = {},
    callback: (arg: unknown) => void,
) => {
    const { page = 1, limit = 10 } = payload;

    try {
        const chatList = await getMyChatList(user.userId, page, limit);

        const userSocketId = getSocketIdByUserId(user.userId);
        if (userSocketId) {
            io.to(userSocketId).emit('chat_list', chatList);
        }

        callbackFn(callback, {
            success: true,
            message: 'Chat list fetched successfully',
            data: chatList,
        });
    } catch (error: any) {
        callbackFn(callback, { success: false, message: error?.message });
    }
};

export default getChatList;