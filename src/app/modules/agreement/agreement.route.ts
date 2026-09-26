import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constants";
import { agreementController } from "./agreement.controller";
import validateRequest from "../../middleware/validateRequest";
import { agreementValidation } from "./agreement.validation";

const router = Router();
router.patch("/seller-authorize/:id", validateRequest(agreementValidation.addAuthorizedSignerValidation), auth(USER_ROLE.user), agreementController.addSellerAuthorizedSigner);

router.patch("/buyer-authorize/:id", validateRequest(agreementValidation.addAuthorizedSignerValidation), auth(USER_ROLE.user), agreementController.addBuyerAuthorizedSigner);

router.patch("/:id/sign", validateRequest(agreementValidation.signAgreementValidation), agreementController.signAgreement);

router.get("/", auth(USER_ROLE.user), agreementController.getAgreements);

router.get("/:id", agreementController.getAgreementByOfferId);



export const agreementRoute = router;
