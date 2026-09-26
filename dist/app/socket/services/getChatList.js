"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyChatList = void 0;
const mongoose_1 = require("mongoose");
const chat_model_1 = require("../../modules/chat/chat.model");
const getMyChatList = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const chats = yield chat_model_1.Chat.aggregate([
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
    const totalCount = yield chat_model_1.Chat.countDocuments({ participants: userObjectId });
    // reshape into the exact ChatListItem contract the frontend expects
    const data = chats.map((c) => {
        var _a, _b;
        return ({
            chat: {
                _id: c._id.toString(),
                participants: c.participants.map((p) => {
                    var _a;
                    return ({
                        _id: p._id.toString(),
                        name: p.name,
                        profile: (_a = p.profile) !== null && _a !== void 0 ? _a : null,
                    });
                }),
            },
            message: c.lastMessage
                ? {
                    text: (_a = c.lastMessage.text) !== null && _a !== void 0 ? _a : '',
                    imageUrl: ((_b = c.lastMessage.images) !== null && _b !== void 0 ? _b : []).map((img) => img.url),
                    sender: c.lastMessage.senderId.toString(),
                    createdAt: c.lastMessage.createdAt,
                    seen: c.lastMessage.seen,
                }
                : null,
            unreadMessageCount: c.unreadMessageCount,
        });
    });
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
});
exports.getMyChatList = getMyChatList;
