import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getSocketIdByUserId, getUserIdBySocketId, removeUserSocket, setUserSocket } from './utils/onlineUsers';
import getReceiverId from './services/getReceiverId';
import sendMessage from './handlers/sendMessage.handlers';
import SeenMessageHandlers from './handlers/seenMessages.handlers';
import getChatList from './handlers/chatList.handlers';
import MessagePageHandlers from './handlers/massagePage.handlers';
import { getOnlineUserIds } from './handlers/onlineUser.handlers';
import { socketAuthMiddleware } from './middleware/auth.socket';



const handleTypingEvent = async (
    io: Server,
    socket: Socket,
    chatId: string,
    event: 'typing' | 'stopTyping',
) => {
    const receiverId = await getReceiverId(chatId, socket.data.userId);
    if (!receiverId) return;

    const userSocketId = getSocketIdByUserId(receiverId);
    if (!userSocketId) return;

    const message =
        event === 'typing'
            ? `${socket.data.name} is typing...`
            : `${socket.data.name} stopped typing...`;

    io.to(userSocketId).emit(event, { message });
};

const initializeSocket = async (server: HttpServer) => {
    const io = new Server(server, { cors: { origin: '*' } });

    // No Redis adapter — single-instance only. See note at top of this response.

    io.use(socketAuthMiddleware);

    io.on('connection', async (socket: Socket) => {
        const userId = socket.data?.userId as string;

        if (!userId) {
            console.warn(`Socket ${socket.id} connected without userId — disconnecting`);
            socket.disconnect();
            return;
        }

        console.log(`✅ Connected: userId=${userId} socketId=${socket.id}`);
        setUserSocket(userId, socket.id);

        socket.on('getOnlineUsers', () => getOnlineUserIds(io));

        socket.on('message_page', (payload, callback) =>
            MessagePageHandlers(io, payload, userId, callback),
        );

        socket.on('my_chat_list', (payload, callback) =>
            getChatList(io, socket.data, payload, callback),
        );

        socket.on('seen', ({ chatId }: { chatId: string }, callback) =>
            SeenMessageHandlers(io, chatId, socket.data, callback),
        );

        socket.on('send_message', (payload, callback) =>
            sendMessage(io, payload, socket.data, callback),
        );

        socket.on('typing', ({ chatId }: { chatId: string }) =>
            handleTypingEvent(io, socket, chatId, 'typing').catch((err) =>
                console.error('typing error:', err),
            ),
        );

        socket.on('stopTyping', ({ chatId }: { chatId: string }) =>
            handleTypingEvent(io, socket, chatId, 'stopTyping').catch((err) =>
                console.error('stopTyping error:', err),
            ),
        );

        socket.on('disconnect', () => {
            const uid = getUserIdBySocketId(socket.id);
            if (uid) {
                removeUserSocket(uid, socket.id);
                console.log(`❌ Disconnected: userId=${uid} socketId=${socket.id}`);
            }
        });
    });

    return io;
};

export default initializeSocket;