
import { Router } from 'express';
import { reportsController } from './reports.controller';

const router = Router();

router.post('/', reportsController.createReports);
router.patch('/:id', reportsController.updateReports);
router.delete('/:id', reportsController.deleteReports);
router.get('/:id', reportsController.getReportsById);
router.get('/', reportsController.getAllReports);

export const reportsRoutes = router;