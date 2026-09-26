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
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsService = void 0;
const offer_models_1 = require("../offer/offer.models");
const properties_constants_1 = require("../properties/properties.constants");
const properties_models_1 = require("../properties/properties.models");
const user_constants_1 = require("../user/user.constants");
const user_models_1 = require("../user/user.models");
const getPlatformStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const activeListings = yield properties_models_1.Property.countDocuments({
        status: { $in: [properties_constants_1.STATUS.active, properties_constants_1.STATUS.under_contact] },
        isDeleted: false,
    });
    const registeredUsers = yield user_models_1.User.countDocuments({
        role: { $ne: 'admin' },
        isDeleted: false,
    });
    const dealsClosed = yield properties_models_1.Property.countDocuments({
        status: properties_constants_1.STATUS.sold,
        isDeleted: false,
    });
    const totalOffers = yield offer_models_1.Offer.countDocuments({
        isDeleted: false,
    });
    return {
        activeListings,
        registeredUsers,
        dealsClosed,
        totalOffers,
    };
});
const getUserOverview = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const y = year ? Number(year) : new Date().getFullYear();
    const start = new Date(`${y}-01-01T00:00:00.000Z`);
    const end = new Date(`${y + 1}-01-01T00:00:00.000Z`);
    const agg = yield user_models_1.User.aggregate([
        {
            $match: {
                isDeleted: false,
                role: user_constants_1.USER_ROLE.user,
                createdAt: { $gte: start, $lt: end },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
    ]);
    const countMap = new Map(agg.map((a) => [a._id, a.count]));
    const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const months = monthLabels.map((label, index) => ({
        month: label,
        count: countMap.get(index + 1) || 0, // $month is 1-indexed
    }));
    const totalUsers = months.reduce((sum, m) => sum + m.count, 0);
    return { year: y, months, totalUsers };
});
exports.statsService = { getPlatformStats, getUserOverview };
