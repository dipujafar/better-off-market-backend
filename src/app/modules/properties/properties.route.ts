import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import { AnyZodObject } from 'zod';
import { propertyController } from './properties.controller';
import validateRequest from '../../middleware/validateRequest';
import { propertyValidation } from './properties.validation';
import parseData from '../../middleware/parseData';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import processPropertyFiles from './properties.upload.middleware';

const router = Router();
const upload = multer({ storage: memoryStorage() });

const propertyUploadFields = upload.fields([
    { name: 'photos', maxCount: 20 },
    { name: 'documents', maxCount: 10 },
    { name: 'assignableContractFile', maxCount: 1 },
]);

router.post(
    '/',
    auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    propertyUploadFields,
    parseData(),
    processPropertyFiles,
    validateRequest(propertyValidation.createPropertyValidationSchema as any),
    propertyController.createProperty,
);
router.get('/', propertyController.getAllProperties);

router.get('/:id', propertyController.getPropertyById);

router.patch(
    '/:id',
    auth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    propertyUploadFields,
    parseData(),
    processPropertyFiles,
    validateRequest(propertyValidation.updatePropertyValidationSchema),
    propertyController.updateProperty,
);

router.delete(
    '/:id',
    auth(USER_ROLE.user),
    propertyController.deleteProperty,
);

export const propertiesRoutes = router;