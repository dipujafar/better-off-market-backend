/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser } from './user.interface';
import { User } from './user.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { checkUserExit } from './user.utils';
import Requests from '../product-requests/requests.models';
import Orders from '../orders/orders.models';
import { orderStatus } from '../orders/orders.constants';
import { sendNotificationMessage } from '../notification/notification.utils';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
const createUser = async (payload: IUser): Promise<IUser> => {
  const exitUser = await checkUserExit(payload);

  if (exitUser) {
    return exitUser;
  }

  if (payload?.isGoogleLogin) {
    payload.verification = {
      otp: 0,
      expiresAt: new Date(Date.now()),
      status: true,
    };
  }

  if (!payload.isGoogleLogin && !payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  const user = await User.create(payload);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }
  const admin = await User.GetAdminUser();
  const notificationPayload = {
    message: `New User Created An Account`,
    description: `A new user has registered with the name ${user.name}.`,
    userId: admin?._id?.toString()!,
    fcmToken: admin?.fcmToken
  };

  await sendNotificationMessage(notificationPayload);

  return user;
};

const getAllUser = async (query: Record<string, any>) => {
  const userModel = new QueryBuilder(
    User.find({ role: { $ne: 'admin' } }).select('-password'),
    query,
  )
    .search(['name', 'email', 'phoneNumber', 'status'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const users: any = await userModel.modelQuery;
  const meta = await userModel.countTotal();

  // Extract user IDs from the paginated result
  const userIds = users.map((user: any) => user._id);

  // Aggregate requests count per user
  const requestCounts = await Requests.aggregate([
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
  const orderCounts = await Orders.aggregate([
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
            $cond: [{ $eq: ['$status', orderStatus.completed] }, 1, 0],
          },
        },
      },
    },
  ]);

  // Build lookup maps for O(1) access
  const requestMap = new Map(
    requestCounts.map((r: any) => [r._id.toString(), r.totalRequests]),
  );

  const orderMap = new Map(
    orderCounts.map((o: any) => [
      o._id.toString(),
      {
        totalOrders: o.totalOrders,
        completedOrders: o.completedOrders,
      },
    ]),
  );

  // Merge stats into each user object
  const data = users.map((user: any) => {
    const userId = user._id.toString();
    const orderStats = orderMap.get(userId) ?? {
      totalOrders: 0,
      completedOrders: 0,
    };

    return {
      ...user.toObject(),
      totalRequests: requestMap.get(userId) ?? 0,
      totalOrders: orderStats.totalOrders,
      completedOrders: orderStats.completedOrders,
    };
  });

  return {
    data,
    meta,
  };
};

const geUserById = async (id: string) => {
  const result = await User.findById(id).select('-password');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(id, payload, { new: true });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  return user;
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return user;
};

const getUserOverviewChart = async (query: Record<string, any>) => {
  const year = query.year ? parseInt(query.year) : new Date().getFullYear();

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const monthlyData = await User.aggregate([
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
  const countMap = new Map(
    monthlyData.map((item: any) => [item._id, item.count]),
  );

  // Get the max value across months to calculate background bar (target)
  const maxCount = Math.max(
    ...Array.from(countMap.values() as Iterable<number>),
    0,
  );
  // Round up to nearest 10 for a clean chart ceiling
  const chartMax = Math.ceil((maxCount + 10) / 10) * 10;

  const data = months.map((month, index) => {
    const monthNumber = index + 1;
    const registered = countMap.get(monthNumber) ?? 0;
    return {
      month,
      registered, // actual green bar value
      target: chartMax, // light background bar value (chart ceiling)
    };
  });

  // Overall summary
  const totalRegistered = data.reduce((sum, d) => sum + d.registered, 0);
  const currentMonth = new Date().getMonth(); // 0-indexed
  const currentMonthCount =
    year === new Date().getFullYear() ? data[currentMonth].registered : null;

  return {
    year,
    chartMax,
    totalRegistered,
    currentMonthCount,
    data,
  };
};

const getDashboardStats = async () => {
  const now = new Date();

  // Current month range
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Last month range
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  // ─── helper: % change ────────────────────────────────────────────────────────
  const percentChange = (current: number, last: number): number => {
    if (last === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - last) / last) * 100).toFixed(1));
  };

  // ─── Users ───────────────────────────────────────────────────────────────────
  const [totalUsers, currentMonthUsers, lastMonthUsers] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' }, isDeleted: false }),
    User.countDocuments({
      role: { $ne: 'admin' },
      isDeleted: false,
      createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
    } as any),
    User.countDocuments({
      role: { $ne: 'admin' },
      isDeleted: false,
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    } as any),
  ]);

  // ─── Requests ────────────────────────────────────────────────────────────────
  const [totalRequests, currentMonthRequests, lastMonthRequests] =
    await Promise.all([
      Requests.countDocuments({ isDeleted: false }),
      Requests.countDocuments({
        isDeleted: false,
        createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
      } as any),
      Requests.countDocuments({
        isDeleted: false,
        createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
      } as any),
    ]);

  // ─── Orders ──────────────────────────────────────────────────────────────────
  const [totalOrders, currentMonthOrders, lastMonthOrders] = await Promise.all([
    Orders.countDocuments({ isDeleted: { $ne: true } }),
    Orders.countDocuments({
      isDeleted: { $ne: true },
      createdAt: { $gte: currentMonthStart, $lt: currentMonthEnd },
    } as any),
    Orders.countDocuments({
      isDeleted: { $ne: true },
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    } as any),
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
      percentVsLastMonth: percentChange(
        currentMonthRequests,
        lastMonthRequests,
      ),
    },
    totalOrders: {
      count: totalOrders,
      currentMonth: currentMonthOrders,
      lastMonth: lastMonthOrders,
      percentVsLastMonth: percentChange(currentMonthOrders, lastMonthOrders),
    },
  };
};

export const userService = {
  createUser,
  getAllUser,
  geUserById,
  updateUser,
  deleteUser,
  getUserOverviewChart,
  getDashboardStats,
};
