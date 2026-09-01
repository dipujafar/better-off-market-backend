import { Chat } from '../../modules/chat/chat.model';

const getReceiverId = async (chatId: string, currentUserId: string) => {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    const receiver = chat.participants.find(
        (p) => p.toString() !== currentUserId,
    );

    return receiver ? receiver.toString() : null;
};

export default getReceiverId;