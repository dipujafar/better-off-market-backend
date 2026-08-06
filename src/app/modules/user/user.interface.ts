import { Model, Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  status: string;
  name: string;
  email: string;
  fcmToken: string;
  bio: string;
  phoneNumber: string;
  password: string;
  privacySettings: boolean;

  // profile Details
  gender: 'Male' | 'Female' | 'Others';
  rank: string;

  referralCode: string;
  fleet: 797 | 777 | 787 | 350 | 380;
  agreements: string;

  dateOfBirth: string;
  customerId: string;
  profile: string;
  loginWth: 'google' | 'apple' | 'facebook' | 'credentials';
  role: string;
  isGoogleLogin: boolean;
  location?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  isDeleted: boolean;
  expireAt: Date;
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
  device: {
    ip: string;
    browser: string;
    os: string;
    device: string;
    lastLogin: string;
  };
}

export interface IExitUser {
  user: IUser;
  emailExists: boolean;
  phoneExists: boolean;
}

export interface UserModel extends Model<IUser> {
  isUserExist(phoneNumber: string): Promise<IUser>;
  isUserExistEmail(email: string): Promise<IUser>;
  isUserExist(
    phoneNumber: string | undefined,
    email: string | undefined,
  ): Promise<IExitUser>;
  IsUserExistId(id: string): Promise<IUser>;
  IsUserExistUserName(userName: string): Promise<IUser>;
  GetAdminUser(): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
