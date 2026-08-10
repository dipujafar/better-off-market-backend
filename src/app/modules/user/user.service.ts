/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser } from './user.interface';
import { User } from './user.models';
import { checkUserExit } from './user.utils';
import { sendNotificationMessage } from '../notification/notification.utils';

export type IFilter = {
  searchTerm?: string;
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


export const userService = {
  createUser,
  geUserById,
  updateUser,
  deleteUser,
};
