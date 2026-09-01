import jwt, { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import config from '../../config';
import { User } from '../../modules/user/user.models';

export const socketAuthMiddleware = async (
    socket: Socket,
    next: (err?: Error) => void,
) => {
    try {
        const token =
            socket.handshake.auth?.token || socket.handshake.headers?.token;

        if (!token) {
            return next(new Error('Authentication token missing'));
        }

        const decoded = jwt.verify(
            token as string,
            config.jwt_access_secret as string,
        ) as JwtPayload & { userId: string };

        const user = await User.findById(decoded.userId);
        if (!user || user.isDeleted) {
            return next(new Error('Authentication failed'));
        }

        socket.data = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
            name: user.name,
            profile: user.profile || null,
        };

        next();
    } catch (err) {
        next(err as Error);
    }
};