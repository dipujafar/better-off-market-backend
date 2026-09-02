import { Server } from 'socket.io';
import callbackFn from '../utils/callbackFn';
import { Chat } from '../../modules/chat/chat.model';
import { Message } from '../../modules/message/message.model';
import { serializeMessage } from '../utils/serializeMessage';
import getChatList from './chatList.handlers';
import { getSocketIdByUserId } from '../utils/onlineUsers';

interface IPayload {
    imageUrl?: string[]; // matches frontend's field name
    text?: string;
    receiver: string; // matches frontend's field name
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
                participants: { $all: [user.userId, payload.receiver], $size: 2 },
            });

            if (!chat) {
                chat = await Chat.create({
                    status: 'accepted',
                    participants: [user.userId, payload.receiver],
                });
            }

            chatId = chat._id.toString();
        }

        const message = await Message.create({
            chatId,
            senderId: user.userId,
            receiverId: payload.receiver,
            text: payload.text ?? null,
            images: payload.imageUrl?.length
                ? payload.imageUrl.map((url) => ({ url }))
                : [],
        });

        await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

        const serialized = serializeMessage(message);

        const senderSocketId = getSocketIdByUserId(user.userId);
        const receiverSocketId = getSocketIdByUserId(payload.receiver);

        // namespaced event, raw message object — matches frontend exactly
        const eventName = `new-message::${chatId}`;
        if (senderSocketId) io.to(senderSocketId).emit(eventName, serialized);
        if (receiverSocketId) io.to(receiverSocketId).emit(eventName, serialized);

        await getChatList(io, { userId: user.userId }, {}, () => { });
        await getChatList(io, { userId: payload.receiver }, {}, () => { });

        callbackFn(callback, {
            success: true,
            message: 'Message sent successfully',
            data: serialized,
        });
    } catch (error: any) {
        callbackFn(callback, { success: false, message: error?.message });
    }
};

export default sendMessage;