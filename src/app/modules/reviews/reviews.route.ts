
import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import validateRequest from '../../middleware/validateRequest';
import { reviewValidation } from './reviews.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.user), validateRequest(reviewValidation.createReviewValidationSchema), reviewsController.createReviews);
router.patch('/:id', reviewsController.updateReviews);
router.delete('/:id', reviewsController.deleteReviews);
router.get('/:id', reviewsController.getReviewsById);
router.get('/', reviewsController.getAllReviews);

export const reviewsRoutes = router;