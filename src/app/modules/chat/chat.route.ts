import { Router } from 'express';
import { chatController } from './chat.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.get(
    '/',
    auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    chatController.getAllConversations,
);

router.get(
    '/:id',
    auth(USER_ROLE.admin, USER_ROLE.sub_admin, USER_ROLE.super_admin),
    chatController.getConversationById,
);

export const chatRoutes = router;