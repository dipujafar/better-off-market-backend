import { Router } from 'express';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { notificationRoutes } from '../modules/notification/notificaiton.route';
import { contentsRoutes } from '../modules/contents/contents.route';
import { requestsRoutes } from '../modules/product-requests/requests.route';
import { categoryRoutes } from '../modules/category/category.route';
import { moneyTransferCompanyRoutes } from '../modules/moneyTransferCompany/moneyTransferCompany.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { ordersRoutes } from '../modules/orders/orders.route';

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
    path: '/products-requests',
    route: requestsRoutes,
  },
  {
    path: '/categories',
    route: categoryRoutes,
  },
  {
    path: '/money-transfer-companies',
    route: moneyTransferCompanyRoutes,
  },
  {
    path: '/payments',
    route: paymentRoutes,
  },
  {
    path: '/orders',
    route: ordersRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
