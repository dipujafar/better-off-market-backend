"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const notificaiton_route_1 = require("../modules/notification/notificaiton.route");
const contents_route_1 = require("../modules/contents/contents.route");
const requests_route_1 = require("../modules/product-requests/requests.route");
const category_route_1 = require("../modules/category/category.route");
const moneyTransferCompany_route_1 = require("../modules/moneyTransferCompany/moneyTransferCompany.route");
const payment_route_1 = require("../modules/payment/payment.route");
const orders_route_1 = require("../modules/orders/orders.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/otp',
        route: otp_routes_1.otpRoutes,
    },
    {
        path: '/notifications',
        route: notificaiton_route_1.notificationRoutes,
    },
    {
        path: '/contents',
        route: contents_route_1.contentsRoutes,
    },
    {
        path: '/products-requests',
        route: requests_route_1.requestsRoutes,
    },
    {
        path: '/categories',
        route: category_route_1.categoryRoutes,
    },
    {
        path: '/money-transfer-companies',
        route: moneyTransferCompany_route_1.moneyTransferCompanyRoutes,
    },
    {
        path: '/payments',
        route: payment_route_1.paymentRoutes,
    },
    {
        path: '/orders',
        route: orders_route_1.ordersRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
