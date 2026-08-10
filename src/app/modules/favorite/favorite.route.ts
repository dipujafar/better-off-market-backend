
import { Router } from 'express';
import { favoriteController } from './favorite.controller';
import { USER_ROLE } from '../user/user.constants';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { favoriteValidation } from './favorite.validation';

const router = Router();

router.post('/', validateRequest(favoriteValidation.guestValidationSchema), auth(USER_ROLE.user), favoriteController.createFavorite);
router.patch('/:id', favoriteController.updateFavorite);
router.delete('/:id', auth(USER_ROLE.user), favoriteController.deleteFavorite);
router.get('/:id', favoriteController.getFavoriteById);
router.get('/', auth(USER_ROLE.user), favoriteController.getAllFavorite);

export const favoriteRoutes = router;