import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { agreementService } from "./agreement.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const addSellerAuthorizedSigner = catchAsync(async (req: Request, res: Response) => {
    const result = await agreementService.addSellerAuthorizedSigner(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Seller authorized signer added successfully',
        data: result,
    });
})


const addBuyerAuthorizedSigner = catchAsync(async (req: Request, res: Response) => {
    const result = await agreementService.addBuyerAuthorizedSigner(req.params.id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Buyer authorized signer added successfully',
        data: result,
    });
})

export const agreementController = {
    addSellerAuthorizedSigner,
    addBuyerAuthorizedSigner
}