"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("./user.models");
const QueryBuilder_1 = __importDefault(require("../../class/builder/QueryBuilder"));
const user_utils_1 = require("./user.utils");
const requests_models_1 = __importDefault(require("../product-requests/requests.models"));
const orders_models_1 = __importDefault(require("../orders/orders.models"));
const orders_constants_1 = require("../orders/orders.constants");
const notification_model_1 = require("../notification/notification.model");
const firebase_1 = require("../../utils/firebase");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exitUser = yield (0, user_utils_1.checkUserExit)(payload);
    if (exitUser) {
        return exitUser;
    }
    if (payload === null || payload === void 0 ? void 0 : payload.isGoogleLogin) {
        payload.verification = {
            otp: 0,
            expiresAt: new Date(Date.now()),
            status: true,
        };
    }
    if (!payload.isGoogleLogin && !payload.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is required');
    }
    const user = yield user_models_1.User.create(payload);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User creation failed');
    }
    const admin = yield user_models_1.User.GetAdminUser();
    const notificationPayload = {
        message: `New User Created An Account`,
        description: `A new user has registered with the name ${user.name}.`,
    };
    yield notification_model_1.Notification.create(Object.assign(Object.assign({}, notificationPayload), { receiver: (admin === null || admin === void 0 ? void 0 : admin._id.toString()) || '' }));
    if (admin.fcmToken) {
        yield (0, firebase_1.sendNotification)([admin.fcmToken], Object.assign(Object.assign({}, notificationPayload), { userId: (admin === null || admin === void 0 ? void 0 : admin._id.toString()) || '' }));
    }
    return user;
});
const getAllUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const userModel = new QueryBuilder_1.default(user_models_1.User.find({ role: { $ne: 'admin' } }).select('-password'), query)
        .search(['name', 'email', 'phoneNumber', 'status'])
        .filter()
        .paginate()
        .sort()
        .fields();
    const users = yield userModel.modelQuery;
    const meta = yield userModel.countTotal();
    // Extract user IDs from the paginated result
    const userIds = users.map((user) => user._id);
    // Aggregate requests count per user
    const requestCounts = yield requests_models_1.default.aggregate([
        {
            $match: {
                user: { $in: userIds },
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: '$user',
                totalRequests: { $sum: 1 },
            },
        },
    ]);
    // Aggregate orders count per user (total + completed)
    const orderCounts = yield orders_models_1.default.aggregate([
        {
            $match: {
                user: { $in: userIds },
                isDeleted: { $ne: true },
            },
        },
        {
            $group: {
                _id: '$user',
                totalOrders: { $sum: 1 },
                completedOrders: {
                    $sum: {
                        $cond: [{ $eq: ['$status', orders_constants_1.orderStatus.completed] }, 1, 0],
                    },
                },
            },
        },
    ]);
    // Build lookup maps for O(1) access
    const requestMap = new Map(requestCounts.map((r) => [r._id.toString(), r.totalRequests]));
    const orderMap = new Map(orderCounts.map((o) => [
        o._id.toString(),
        {
            totalOrders: o.totalOrders,
            completedOrders: o.completedOrders,
        },
    ]));
    // Merge stats into each user object
    const data = users.map((user) => {
        var _a, _b;
        const userId = user._id.toString();
        const orderStats = (_a = orderMap.get(userId)) !== null && _a !== void 0 ? _a : {
            totalOrders: 0,
            completedOrders: 0,
        };
        return Object.assign(Object.assign({}, user.toObject()), { totalRequests: (_b = requestMap.get(userId)) !== null && _b !== void 0 ? _b : 0, totalOrders: orderStats.totalOrders, completedOrders: orderStats.completedOrders });
    });
    return {
        data,
        meta,
    };
});
const geUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_models_1.User.findById(id).select('-password');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return result;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, payload, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User updating failed');
    }
    return user;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'user deleting failed');
    }
    return user;
});
const getUserOverviewChart = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const year = query.year ? parseInt(query.year) : new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);
    const monthlyData = yield user_models_1.User.aggregate([
        {
            $match: {
                role: { $ne: 'admin' },
                isDeleted: false,
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    // Build all 12 months, fill 0 for months with no registrations
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    // Map aggregation result by month number
    const countMap = new Map(monthlyData.map((item) => [item._id, item.count]));
    // Get the max value across months to calculate background bar (target)
    const maxCount = Math.max(...Array.from(countMap.values()), 0);
    // Round up to nearest 10 for a clean chart ceiling
    const chartMax = Math.ceil((maxCount + 10) / 10) * 10;
    const data = months.map((month, index) => {
        var _a;
        const monthNumber = index + 1;
        const registered = (_a = countMap.get(monthNumber)) !== null && _a !== void 0 ? _a : 0;
        return {
            month,
            registered, // actual green bar value
            target: chartMax, // light background bar value (chart ceiling)
        };
    });
    // Overall summary
    const totalRegistered = data.reduce((sum, d) => sum + d.registered, 0);
    const currentMonth = new Date().getMonth(); // 0-indexed
    const currentMonthCount = year === new Date().getFullYear() ? data[currentMonth].registered : null;
    return {
        year,
        chartMax,
        totalRegistered,
        currentMonthCount,
        data,
    };
});
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    // Current month range
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    // Last month range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    // ─── helper: % change ────────────────────────────────────────────────────────
    const percentChange = (current, last) => {
        if (last === 0)
            return current > 0 ? 100 : 0;
        return parseFloat((((current - last) / last) * 100).toFixed(1));
    };
    // ─── Users ───────────────────────────────────────────────────────────────────
    const [totalUsers, currentMonthUsers, lastMonthUsers] = yield Promise.all([
        user_models_1.User.countDocuments({ role: { $ne: 'admin' }, isDeleted: false }),
        user_models_1.User.countDocuments({
            role: { $ne: 'admin' },
            isDeleted: false,
            createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
        }),
        user_models_1.User.countDocuments({
            role: { $ne: 'admin' },
            isDeleted: false,
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        }),
    ]);
    // ─── Requests ────────────────────────────────────────────────────────────────
    const [totalRequests, currentMonthRequests, lastMonthRequests] = yield Promise.all([
        requests_models_1.default.countDocuments({ isDeleted: false }),
        requests_models_1.default.countDocuments({
            isDeleted: false,
            createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
        }),
        requests_models_1.default.countDocuments({
            isDeleted: false,
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        }),
    ]);
    // ─── Orders ──────────────────────────────────────────────────────────────────
    const [totalOrders, currentMonthOrders, lastMonthOrders] = yield Promise.all([
        orders_models_1.default.countDocuments({ isDeleted: { $ne: true } }),
        orders_models_1.default.countDocuments({
            isDeleted: { $ne: true },
            createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
        }),
        orders_models_1.default.countDocuments({
            isDeleted: { $ne: true },
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        }),
    ]);
    return {
        totalUsers: {
            count: totalUsers,
            currentMonth: currentMonthUsers,
            lastMonth: lastMonthUsers,
            percentVsLastMonth: percentChange(currentMonthUsers, lastMonthUsers),
        },
        totalRequests: {
            count: totalRequests,
            currentMonth: currentMonthRequests,
            lastMonth: lastMonthRequests,
            percentVsLastMonth: percentChange(currentMonthRequests, lastMonthRequests),
        },
        totalOrders: {
            count: totalOrders,
            currentMonth: currentMonthOrders,
            lastMonth: lastMonthOrders,
            percentVsLastMonth: percentChange(currentMonthOrders, lastMonthOrders),
        },
    };
});
exports.userService = {
    createUser,
    getAllUser,
    geUserById,
    updateUser,
    deleteUser,
    getUserOverviewChart,
    getDashboardStats,
};
