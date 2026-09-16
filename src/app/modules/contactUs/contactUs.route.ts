import { Router } from "express";
import { contactUsController } from "./contactUs.controller";
import validateRequest from "../../middleware/validateRequest";
import { contactUsValidation } from "./contactUs.validation";

const router = Router();

router.post("/", validateRequest(contactUsValidation.sendContactUsValidation), contactUsController.contactUs);

export const contactRouter = router;