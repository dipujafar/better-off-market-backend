"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const notificaiton_route_1 = require("../modules/notification/notificaiton.route");
const contents_route_1 = require("../modules/contents/contents.route");
const properties_route_1 = require("../modules/properties/properties.route");
const favorite_route_1 = require("../modules/favorite/favorite.route");
const reviews_route_1 = require("../modules/reviews/reviews.route");
const reports_route_1 = require("../modules/reports/reports.route");
const getInTouch_route_1 = require("../modules/getInTouch/getInTouch.route");
const offer_route_1 = require("../modules/offer/offer.route");
const upload_route_1 = require("../modules/upload/upload.route");
const stats_route_1 = require("../modules/stats/stats.route");
const dashboard_route_1 = require("../dashboard/dashboard.route");
const faqs_route_1 = require("../modules/faqs/faqs.route");
const chat_route_1 = require("../modules/chat/chat.route");
const contactUs_route_1 = require("../modules/contactUs/contactUs.route");
const agreement_route_1 = require("../modules/agreement/agreement.route");
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
        path: '/properties',
        route: properties_route_1.propertiesRoutes,
    },
    {
        path: '/favorites',
        route: favorite_route_1.favoriteRoutes,
    },
    {
        path: '/reviews',
        route: reviews_route_1.reviewsRoutes,
    },
    {
        path: '/reports',
        route: reports_route_1.reportsRoutes,
    },
    {
        path: '/get-in-touch',
        route: getInTouch_route_1.getInTouchRoutes,
    },
    {
        path: '/offers',
        route: offer_route_1.offerRoutes,
    },
    {
        path: '/upload',
        route: upload_route_1.uploadRoutes,
    },
    {
        path: '/stats',
        route: stats_route_1.statsRoutes,
    },
    {
        path: '/faqs',
        route: faqs_route_1.faqsRoutes,
    },
    {
        path: '/dashboard',
        route: dashboard_route_1.dashboardRoutes,
    },
    {
        path: '/chats',
        route: chat_route_1.chatRoutes,
    },
    {
        path: '/contact-us',
        route: contactUs_route_1.contactRouter,
    },
    {
        path: '/agreements',
        route: agreement_route_1.agreementRoute,
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
