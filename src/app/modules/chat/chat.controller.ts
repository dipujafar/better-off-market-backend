import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { chatService } from './chat.service';

const getAllConversations = catchAsync(async (req: Request, res: Response) => {
    const result = await chatService.getAllConversations(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Conversations fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getConversationById = catchAsync(async (req: Request, res: Response) => {
    const result = await chatService.getConversationById(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Conversation fetched successfully',
        data: result,
    });
});

export const chatController = { getAllConversations, getConversationById };