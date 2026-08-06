import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { IUser } from './user.interface';
import { User } from './user.models';
import bcrypt from 'bcrypt';
import config from '../../config';

export const checkUserExit = async (payload: IUser) => {
  //   const isExist = await User.isUserExist(payload.phoneNumber as string);
  //   const isExistEmail = await User.isUserExistEmail(payload.email as string);
  const isExist = await User.isUserExist(
    payload.phoneNumber as string,
    payload.email as string,
  );

  if (isExist?.phoneExists && !isExist?.user?.verification?.status) {
    const { phoneNumber, ...updateData } = payload;
    updateData.password = await bcrypt.hash(
      payload?.password,
      Number(config.bcrypt_salt_rounds),
    );
    const user = await User.findByIdAndUpdate(isExist?.user?._id, updateData, {
      new: true,
    });
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user creation failed');
    }
    return user;
  } else if (isExist?.emailExists && !isExist?.user?.verification?.status) {
    const { email, ...updateData } = payload;
    updateData.password = await bcrypt.hash(
      payload?.password,
      Number(config.bcrypt_salt_rounds),
    );
    const user = await User.findByIdAndUpdate(isExist?.user?._id, updateData, {
      new: true,
    });
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'user creation failed');
    }
    return user;
  } else if (isExist?.emailExists && isExist?.user?.verification?.status) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  } else if (isExist?.phoneExists && isExist?.user?.verification?.status) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this phone number',
    );
  }
};
