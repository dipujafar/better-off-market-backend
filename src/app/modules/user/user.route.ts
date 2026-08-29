import { Router } from 'express';
import { userController } from './user.controller';
import validateRequest from '../../middleware/validateRequest';
import { userValidation } from './user.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from './user.constants';
import parseData from '../../middleware/parseData';
import multer, { memoryStorage } from 'multer';

const router = Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  upload.single('profile'),
  parseData(),
  validateRequest(userValidation?.guestValidationSchema),
  userController.createUser,
);

router.patch(
  '/update-my-profile',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  upload.single('profile'),
  parseData(),
  userController.updateMyProfile,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  upload.single('profile'),
  parseData(),
  userController.updateUser,
);

router.delete(
  '/delete-my-account',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  userController.deleteMYAccount,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
  userController.deleteUser,
);

router.get(
  '/my-profile',
  auth(
    USER_ROLE.admin,
    USER_ROLE.sub_admin,
    USER_ROLE.super_admin,
    USER_ROLE.user,
  ),
  userController.getMyProfile,
);

router.get('/seller-profile/:id', userController.getSellerProfile);

router.get(
  '/seller-stats',
  auth(
    USER_ROLE.user
  ),
  userController.getSellerDashboardStats,
);

router.get(
  '/seller/listing-analytics',
  auth(USER_ROLE.user),
  userController.getListingAnalytics,
);


router.get('/:id', userController.getUserById);




export const userRoutes = router;
