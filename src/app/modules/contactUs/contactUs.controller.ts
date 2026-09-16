import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { contactUsService } from "./contactUs.service";

const contactUs = catchAsync(async (req, res) => {
    await contactUsService.contactUs(req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'ContactUs created successfully',
        data: {},
    });
});

export const contactUsController = {
    contactUs
}