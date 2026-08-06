import { sendNotification } from "../../utils/firebase";
import { Notification } from "./notification.model";

type TNotificationType = {
    message: string;
    description: string;
    userId: string;
    fcmToken?: string
}

export const sendNotificationMessage = async ({ message, description, userId, fcmToken }: TNotificationType) => {
    const notificationPayload = {
        message,
        description,
    };

    await Notification.create({
        ...notificationPayload,
        receiver: userId,
    });

    if (fcmToken) {
        await sendNotification([fcmToken], {
            ...notificationPayload,
            userId: userId,
        });
    }

};
