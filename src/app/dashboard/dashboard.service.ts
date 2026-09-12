
import { Types } from 'mongoose';
import { Offer } from '../modules/offer/offer.models';
import { STATUS } from '../modules/properties/properties.constants';
import { Property } from '../modules/properties/properties.models';
import { PropertyView } from '../modules/PropertyView/PropertyView.model';
import { USER_ROLE } from '../modules/user/user.constants';
import { User } from '../modules/user/user.models';
import Favorite from '../modules/favorite/favorite.models';
import { buildPropertyLabel } from '../modules/user/user.utils';
import { OFFER_STATUS } from '../modules/offer/offer.constants';




const getAdminProfileAnalytics = async () => {
    const [
        totalUsers,
        totalActiveListing,
        totalListing,
        totalOffer,
        topViewedAgg,
        topSavedAgg,
        offerStatusAgg
    ] = await Promise.all([
        User.countDocuments({
            isDeleted: false,
            role: USER_ROLE.user,
        }),
        Property.countDocuments({
            status: { $in: [STATUS.active, STATUS.under_contact] },
            isDeleted: false,
        }),
        Property.countDocuments({
            isDeleted: false,
        }),
        Offer.countDocuments({
            isDeleted: false,
        }),
        PropertyView.aggregate([
            { $group: { _id: '$property', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]) as Promise<{ _id: Types.ObjectId; count: number }[]>,
        Favorite.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$property', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]) as Promise<{ _id: Types.ObjectId; count: number }[]>,
        Offer.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]) as Promise<{ _id: string; count: number }[]>,
    ]);

    // resolve property labels for both top-5 lists in parallel too
    const viewedPropertyIds = topViewedAgg.map((v) => v._id);
    const savedPropertyIds = topSavedAgg.map((s) => s._id);

    const [viewedProperties, savedProperties] = await Promise.all([
        Property.find({ _id: { $in: viewedPropertyIds } }).select(
            'propertyType streetAddress city state specifications',
        ),
        Property.find({ _id: { $in: savedPropertyIds } }).select(
            'propertyType streetAddress city state specifications',
        ),
    ]);

    const viewedPropertyMap = new Map(
        viewedProperties.map((p) => [p._id.toString(), buildPropertyLabel(p)]),
    );
    const savedPropertyMap = new Map(
        savedProperties.map((p) => [p._id.toString(), buildPropertyLabel(p)]),
    );

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
        accepted: offerCountMap.get(OFFER_STATUS.accepted) || 0,
        pending:
            (offerCountMap.get(OFFER_STATUS.pending) || 0) +
            (offerCountMap.get(OFFER_STATUS.countered) || 0),
        rejected: offerCountMap.get(OFFER_STATUS.rejected) || 0,
        withdrawn: offerCountMap.get(OFFER_STATUS.withdrawn) || 0,
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
};
export const dashboardService = {
    getAdminProfileAnalytics,
};