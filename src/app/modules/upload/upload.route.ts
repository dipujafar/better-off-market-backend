import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { uploadController } from './upload.controller';
;

const router = Router();
const upload = multer({ storage: memoryStorage() });

router.post(
    '/',
    auth(
        USER_ROLE.user,
        USER_ROLE.admin,
        USER_ROLE.sub_admin,
        USER_ROLE.super_admin,
    ),
    upload.array('images', 10), // matches formData.append("images", file) per file, cap 10
    uploadController.uploadFiles,
);

export const uploadRoutes = router;