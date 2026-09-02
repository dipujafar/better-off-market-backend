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
                lastMessage: 1,
                unreadMessageCount: 1,
                participants: {
                    $filter: {
                        input: '$participantDetails',
                        as: 'p',
                        cond: { $ne: ['$$p._id', userObjectId] },
                    },
                },
            },
        },
        {
            $project: {
                lastMessage: 1,
                unreadMessageCount: 1,
                'participants._id': 1,
                'participants.name': 1,
                'participants.profile': 1,
            },
        },
    ]);

    const totalCount = await Chat.countDocuments({ participants: userObjectId });

    // reshape into the exact ChatListItem contract the frontend expects
    const data = chats.map((c) => ({
        chat: {
            _id: c._id.toString(),
            participants: c.participants.map((p: any) => ({
                _id: p._id.toString(),
                name: p.name,
                profile: p.profile ?? null,
            })),
        },
        message: c.lastMessage
            ? {
                text: c.lastMessage.text ?? '',
                imageUrl: (c.lastMessage.images ?? []).map((img: any) => img.url),
                sender: c.lastMessage.senderId.toString(),
                createdAt: c.lastMessage.createdAt,
                seen: c.lastMessage.seen,
            }
            : null,
        unreadMessageCount: c.unreadMessageCount,
    }));

    return {
        chats: data,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPage: Math.ceil(totalCount / limit),
            hasMore: skip + data.length < totalCount,
        },
    };
};