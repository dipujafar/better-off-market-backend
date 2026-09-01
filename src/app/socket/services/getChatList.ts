import { Types } from 'mongoose';
import { Chat } from '../../modules/chat/chat.model';

export const getMyChatList = async (
    userId: string,
    page: number = 1,
    limit: number = 10,
) => {
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    const chats = await Chat.aggregate([
        { $match: { participants: userObjectId } },

        // last message per chat
        {
            $lookup: {
                from: 'messages',
                let: { chatId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$chatId', '$$chatId'] } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 },
                ],
                as: 'lastMessage',
            },
        },
        { $addFields: { lastMessage: { $arrayElemAt: ['$lastMessage', 0] } } },

        // unread count per chat, for the CURRENT user only
        {
            $lookup: {
                from: 'messages',
                let: { chatId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$chatId', '$$chatId'] },
                                    { $ne: ['$senderId', userObjectId] },
                                    { $eq: ['$seen', false] },
                                ],
                            },
                        },
                    },
                    { $count: 'count' },
                ],
                as: 'unread',
            },
        },
        {
            $addFields: {
                unreadMessageCount: { $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0] },
            },
        },

        { $sort: { 'lastMessage.createdAt': -1, updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },

        // populate the OTHER participant's basic details
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'participantDetails',
            },
        },
        {
            $project: {
                status: 1,
                lastMessage: 1,
                unreadMessageCount: 1,
                createdAt: 1,
                updatedAt: 1,
                participants: {
                    $filter: {
                        input: '$participantDetails',
                        as: 'p',
                        cond: { $ne: ['$$p._id', userObjectId] },
                    },
                },
            },
        },
        { $project: { 'participants.password': 0, 'participants.verification': 0, 'participants.device': 0 } },
    ]);

    const totalCount = await Chat.countDocuments({ participants: userObjectId });

    return {
        chats,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPage: Math.ceil(totalCount / limit),
            hasMore: skip + chats.length < totalCount,
        },
    };
};