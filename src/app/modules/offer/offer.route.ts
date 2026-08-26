import { Router } from 'express';
import { offerController } from './offer.controller';
import validateRequest from '../../middleware/validateRequest';
import { offerValidation } from './offer.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';
import processOfferFiles from './offer.upload.middleware';

const router = Router();
const upload = multer({ storage: memoryStorage() });

const offerUploadFields = upload.fields([
    { name: 'supportingDocuments', maxCount: 10 },
]);

const allRoles = [
    USER_ROLE.user,
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
];

router.post(
    '/',
    auth(...allRoles),
    offerUploadFields,
    parseData(),
    processOfferFiles,
    validateRequest(offerValidation.createOfferValidationSchema),
    offerController.createOffer,
);

router.patch(
    '/:id/counter',
    auth(...allRoles),
    validateRequest(offerValidation.counterOfferValidationSchema),
    offerController.counterOffer,
);

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    offerController.getAllOffers,
);

router.get('/my-offers', auth(...allRoles), offerController.getMyOffers);

router.get(
    '/received-offers',
    auth(...allRoles),
    offerController.getReceivedOffers,
);

router.patch(
    '/:id',
    auth(...allRoles),
    validateRequest(offerValidation.counterOfferValidationSchema),
    offerController.updateOffer,
);

router.delete('/:id', auth(...allRoles), offerController.deleteOffer);

router.get('/:id', auth(...allRoles), offerController.getOfferById);

export const offerRoutes = router;