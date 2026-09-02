import { Server } from 'socket.io';
import callbackFn from '../utils/callbackFn';
import { User } from '../../modules/user/user.models';
import { Message } from '../../modules/message/message.model';
import { serializeMessage } from '../utils/serializeMessage';
import { getSocketIdByUserId } from '../utils/onlineUsers';

const MessagePageHandlers = async (
    io: Server,
    payload: { userId: string; limit?: number; page?: number },
    currentUserId: string,
    callback: (data: unknown) => void,
) => {
    const { userId, page = 1, limit = 10 } = payload;

    if (!userId) {
        return callbackFn(callback, { success: false, message: 'userId is required' });
    }

    const skip = (page - 1) * limit;

    try {
        const receiverDetails = await User.findById(userId).select('name email profile role');
        if (!receiverDetails) {
            return callbackFn(callback, { success: false, message: 'User not found!' });
        }

        const userSocket = getSocketIdByUserId(currentUserId);
        if (!userSocket) {
            return callbackFn(callback, { success: false, message: 'User socket ID not found' });
        }

        io.to(userSocket).emit('user_details', {
            _id: receiverDetails._id,
            name: receiverDetails.name,
            email: receiverDetails.email,
            profile: receiverDetails.profile,
            role: receiverDetails.role,
        });

        const filter = {
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId },
            ],
        };

        const [messages, totalMessages] = await Promise.all([
            Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Message.countDocuments(filter),
        ]);

        const serialized = messages.map(serializeMessage).reverse();

        const response = {
            data: serialized,
            meta: {
                page,
                limit,
                total: totalMessages,
                totalPage: Math.ceil(totalMessages / limit),
                hasMore: skip + messages.length < totalMessages,
            },
        };

        io.to(userSocket).emit('message', response);
    } catch (error: any) {
        console.error('Error in message-page event:', error);
        callbackFn(callback, { success: false, message: error.message });
    }
};

export default MessagePageHandlers;