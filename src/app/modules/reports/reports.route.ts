
import { Router } from 'express';
import { reportsController } from './reports.controller';
import validateRequest from '../../middleware/validateRequest';
import { reportValidation } from './reports.validation';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth(USER_ROLE.user), validateRequest(reportValidation.createReportValidationSchema), reportsController.createReports);
router.patch('/:id', reportsController.updateReports);
router.delete('/:id', reportsController.deleteReports);
router.get('/:id', reportsController.getReportsById);
router.get('/', reportsController.getAllReports);

export const reportsRoutes = router;