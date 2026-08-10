import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser } from './user.interface';
import { User } from './user.models';
import bcrypt from 'bcrypt';
import config from '../../config';

export const checkUserExit = async (payload: IUser) => {
  const isExist = await User.isUserExistEmail(payload.email as string);

  if (isExist && !isExist?.verification?.status) {
    // User exists but not verified — update their info (e.g. resend OTP flow)
    const updateData = { ...payload };
    updateData.password = await bcrypt.hash(
      payload?.password,
      Number(config.bcrypt_salt_rounds),
    );
    const user = await User.findByIdAndUpdate(isExist?._id, updateData, {
      new: true,
    });
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user creation failed');
    }
    return user;
  } else if (isExist && isExist?.verification?.status) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  // isExist is null/undefined → no user found, caller should proceed to create new user
  return null;
};