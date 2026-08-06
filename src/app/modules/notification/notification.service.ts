/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Notification } from './notification.model';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';

const createNotificationInDb = async (payload: any) => {
  const result = await Notification.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Notification created failed');
  }
  return result;
};

// Insert notifications into the database
const insertNotificationIntoDb = async (payload: any) => {
  const result = await Notification.insertMany(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Notification created failed');
  }
  return result;
};

// Get all notifications
const getAllNotifications = async (query: Record<string, any>) => {
  const notificationModel = new QueryBuilder(Notification.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await notificationModel.modelQuery;
  const meta = await notificationModel.countTotal();
  return {
    data,
    meta,
  };
};

// Mark notifications as read
const markAsDone = async (id: string) => {
  const result = await Notification.updateMany(
    { receiver: id },
    {
      $set: {
        read: true,
      },
    },
    { new: true },
  );
  return result;
};

const deleteNotification = async (id: string) => {
  const result = await Notification.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Notification deletion failed');
  }
  return result;
};

export const notificationServices = {
  createNotificationInDb,
  insertNotificationIntoDb,
  getAllNotifications,
  deleteNotification,
  markAsDone,
};
