import { Router } from 'express';
import { getInTouchController } from './getInTouch.controller';
import validateRequest from '../../middleware/validateRequest';
import { getInTouchValidation } from './getInTouch.validation';

const router = Router();

router.post('/', validateRequest(getInTouchValidation.createGetInTouch), getInTouchController.createGetInTouch);
router.patch('/:id', getInTouchController.updateGetInTouch);
router.delete('/:id', getInTouchController.deleteGetInTouch);
router.get('/:id', getInTouchController.getGetInTouchById);
router.get('/', getInTouchController.getAllGetInTouch);

export const getInTouchRoutes = router;