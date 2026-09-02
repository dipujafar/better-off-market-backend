import { Router } from 'express';
import { statsController } from './stats.controller';

const router = Router();

router.get('/about-page', statsController.getPlatformStats);

export const statsRoutes = router;