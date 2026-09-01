import { Server } from 'socket.io';
import { Chat } from '../../modules/chat/chat.model';
import callbackFn from '../utils/callbackFn';
import { Message } from '../../modules/message/message.model';
import getChatList from './chatList.handlers';
import { getSocketIdByUserId } from '../utils/onlineUsers';

interface IPayload {
    images?: string[];
    text?: string;
    receiverId: string;
    chatId?: string;
}

const sendMessage = async (
    io: Server,
    payload: IPayload,
    user: { userId: string },
    callback: (args: unknown) => void,
) => {
    try {
        let chatId = payload.chatId;

        if (!chatId) {
            let chat = await Chat.findOne({
                participants: { $all: [user.userId, payload.receiverId], $size: 2 },
            });

            if (!chat) {
                chat = await Chat.create({
                    status: 'accepted',
                    participants: [user.userId, payload.receiverId],
                });
            }

            chatId = chat._id.toString();
        }

        const message = await Message.create({
            chatId,
            senderId: user.userId,
            receiverId: payload.receiverId,
            text: payload.text ?? null,
            images: payload.images?.length
                ? payload.images.map((url) => ({ url }))
                : [],
        });

        await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

        const senderSocketId = getSocketIdByUserId(user.userId);
        const receiverSocketId = getSocketIdByUserId(payload.receiverId);

        if (senderSocketId) io.to(senderSocketId).emit('new_message', { message });
        if (receiverSocketId) io.to(receiverSocketId).emit('new_message', { message });

        // no-op callbacks here too — same reasoning as seenMessages
        await getChatList(io, { userId: user.userId }, {}, () => { });
        await getChatList(io, { userId: payload.receiverId }, {}, () => { });

        callbackFn(callback, {
            success: true,
            message: 'Message sent successfully',
            data: message,
        });
    } catch (error: any) {
        console.log(error);
        callbackFn(callback, { success: false, message: error?.message });
    }
};

export default sendMessage;