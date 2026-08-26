import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { notificationRoutes } from '../modules/notification/notificaiton.route';
import { contentsRoutes } from '../modules/contents/contents.route';
import { propertiesRoutes } from '../modules/properties/properties.route';
import { favoriteRoutes } from '../modules/favorite/favorite.route';
import { reviewsRoutes } from '../modules/reviews/reviews.route';
import { reportsRoutes } from '../modules/reports/reports.route';
import { getInTouchRoutes } from '../modules/getInTouch/getInTouch.route';
import { offerRoutes } from '../modules/offer/offer.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/contents',
    route: contentsRoutes,
  },
  {
    path: '/properties',
    route: propertiesRoutes,
  },
  {
    path: '/favorites',
    route: favoriteRoutes,
  },
  {
    path: '/reviews',
    route: reviewsRoutes,
  },
  {
    path: '/reports',
    route: reportsRoutes,
  },
  {
    path: '/get-in-touch',
    route: getInTouchRoutes,
  },
  {
    path: '/offers',
    route: offerRoutes,
  }

];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
