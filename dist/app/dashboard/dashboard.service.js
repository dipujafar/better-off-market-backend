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
exports.dashboardService = void 0;
const offer_models_1 = require("../modules/offer/offer.models");
const properties_constants_1 = require("../modules/properties/properties.constants");
const properties_models_1 = require("../modules/properties/properties.models");
const PropertyView_model_1 = require("../modules/PropertyView/PropertyView.model");
const user_constants_1 = require("../modules/user/user.constants");
const user_models_1 = require("../modules/user/user.models");
const favorite_models_1 = __importDefault(require("../modules/favorite/favorite.models"));
const user_utils_1 = require("../modules/user/user.utils");
const offer_constants_1 = require("../modules/offer/offer.constants");
const getAdminProfileAnalytics = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalUsers, totalActiveListing, totalListing, totalOffer, topViewedAgg, topSavedAgg, offerStatusAgg] = yield Promise.all([
        user_models_1.User.countDocuments({
            isDeleted: false,
            role: user_constants_1.USER_ROLE.user,
        }),
        properties_models_1.Property.countDocuments({
            status: { $in: [properties_constants_1.STATUS.active, properties_constants_1.STATUS.under_contact] },
            isDeleted: false,
        }),
        properties_models_1.Property.countDocuments({
            isDeleted: false,
        }),
        offer_models_1.Offer.countDocuments({
            isDeleted: false,
        }),
        PropertyView_model_1.PropertyView.aggregate([
            { $group: { _id: '$property', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]),
        favorite_models_1.default.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$property', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]),
        offer_models_1.Offer.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
    ]);
    // resolve property labels for both top-5 lists in parallel too
    const viewedPropertyIds = topViewedAgg.map((v) => v._id);
    const savedPropertyIds = topSavedAgg.map((s) => s._id);
    const [viewedProperties, savedProperties] = yield Promise.all([
        properties_models_1.Property.find({ _id: { $in: viewedPropertyIds } }).select('propertyType streetAddress city state specifications'),
        properties_models_1.Property.find({ _id: { $in: savedPropertyIds } }).select('propertyType streetAddress city state specifications'),
    ]);
    const viewedPropertyMap = new Map(viewedProperties.map((p) => [p._id.toString(), (0, user_utils_1.buildPropertyLabel)(p)]));
    const savedPropertyMap = new Map(savedProperties.map((p) => [p._id.toString(), (0, user_utils_1.buildPropertyLabel)(p)]));
    const topViewedProperties = topViewedAgg.map((v) => ({
        propertyId: v._id.toString(),
        label: viewedPropertyMap.get(v._id.toString()) || 'Unknown listing',
        count: v.count,
    }));
    const topSavedProperties = topSavedAgg.map((s) => ({
        propertyId: s._id.toString(),
        label: savedPropertyMap.get(s._id.toString()) || 'Unknown listing',
        count: s.count,
    }));
    // Offer Conversion — accepted / pending / rejected / withdrawn
    const offerCountMap = new Map(offerStatusAgg.map((o) => [o._id, o.count]));
    const offerConversion = {
        accepted: offerCountMap.get(offer_constants_1.OFFER_STATUS.accepted) || 0,
        pending: (offerCountMap.get(offer_constants_1.OFFER_STATUS.pending) || 0) +
            (offerCountMap.get(offer_constants_1.OFFER_STATUS.countered) || 0),
        rejected: offerCountMap.get(offer_constants_1.OFFER_STATUS.rejected) || 0,
        withdrawn: offerCountMap.get(offer_constants_1.OFFER_STATUS.withdrawn) || 0,
    };
    return {
        totalUsers,
        totalActiveListing,
        totalListing,
        totalOffer,
        topViewedProperties,
        topSavedProperties,
        offerConversion
    };
});
exports.dashboardService = {
    getAdminProfileAnalytics,
};
