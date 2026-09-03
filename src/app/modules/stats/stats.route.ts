import { Router } from 'express';
import { statsController } from './stats.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.get('/about-page', statsController.getPlatformStats);

router.get(
    '/user-overview',
    auth(USER_ROLE.admin),
    statsController.getUserOverview,
);

export const statsRoutes = router;