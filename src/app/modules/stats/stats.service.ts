import { STATUS } from '../properties/properties.constants';
import { Property } from '../properties/properties.models';
import { User } from '../user/user.models';


const getPlatformStats = async () => {
    const activeListings = await Property.countDocuments({
        status: { $in: [STATUS.active, STATUS.under_contact] },
        isDeleted: false,
    });

    const registeredUsers = await User.countDocuments({
        isDeleted: false,
    });

    const dealsClosed = await Property.countDocuments({
        status: STATUS.sold,
        isDeleted: false,
    });

    return {
        activeListings,
        registeredUsers,
        dealsClosed,
    };
};

export const statsService = { getPlatformStats };