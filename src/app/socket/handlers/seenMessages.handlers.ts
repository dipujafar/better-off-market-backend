import { Server } from 'socket.io';
import callbackFn from '../utils/callbackFn';
import { Chat } from '../../modules/chat/chat.model';
import { Message } from '../../modules/message/message.model';
import getChatList from './chatList.handlers';

const SeenMessageHandlers = async (
    io: Server,
    chatId: string,
    user: { userId: string },
    callback: (arg: unknown) => void,
) => {
    if (!chatId) {
        return callbackFn(callback, { success: false, message: 'chatId is required' });
    }

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return callbackFn(callback, { success: false, message: 'chat not found' });
        }

        await Message.updateMany(
            { chatId: chat._id, receiverId: user.userId, seen: false },
            { $set: { seen: true } },
        );

        const [user1, user2] = chat.participants;

        if (user1) {
            await getChatList(io, { userId: user1.toString() }, { page: 1, limit: 10 }, () => { });
        }
        if (user2) {
            await getChatList(io, { userId: user2.toString() }, { page: 1, limit: 10 }, () => { });
        }

        callbackFn(callback, { success: true, message: 'Messages marked as seen' });
    } catch (error: any) {
        // console.log(error);
        callbackFn(callback, { success: false, message: error?.message || 'seen message failed' });
    }
};

export default SeenMessageHandlers;