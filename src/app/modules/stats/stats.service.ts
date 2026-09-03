import { Offer } from '../offer/offer.models';
import { STATUS } from '../properties/properties.constants';
import { Property } from '../properties/properties.models';
import { USER_ROLE } from '../user/user.constants';
import { User } from '../user/user.models';


const getPlatformStats = async () => {
    const activeListings = await Property.countDocuments({
        status: { $in: [STATUS.active, STATUS.under_contact] },
        isDeleted: false,
    });

    const registeredUsers = await User.countDocuments({
        role: { $ne: 'admin' },
        isDeleted: false,
    });

    const dealsClosed = await Property.countDocuments({
        status: STATUS.sold,
        isDeleted: false,
    });

    const totalOffers = await Offer.countDocuments({
        isDeleted: false,
    });

    return {
        activeListings,
        registeredUsers,
        dealsClosed,
        totalOffers,
    };
};

const getUserOverview = async (year?: string) => {
    const y = year ? Number(year) : new Date().getFullYear();
    const start = new Date(`${y}-01-01T00:00:00.000Z`);
    const end = new Date(`${y + 1}-01-01T00:00:00.000Z`);

    const agg: { _id: number; count: number }[] = await User.aggregate([
        {
            $match: {
                isDeleted: false,
                role: USER_ROLE.user,
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
};


export const statsService = { getPlatformStats, getUserOverview };