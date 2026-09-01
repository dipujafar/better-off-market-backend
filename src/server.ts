
import app from './app';
import { createServer, type Server } from 'http';
import colors from 'colors';
import initializeSocket from './app/socket';
import config from './app/config';


const socketServer = createServer(app);
let server: Server;

const startSocket = () =>
  initializeSocket(socketServer).then((io) => {
    io.listen(Number(config.socket_port));
    console.log(
      colors.yellow.bold(`⚡ Socket.io running on http://${config.ip}:${config.socket_port}`),
    );
    return io;
  });

const startHttpServer = () =>
  new Promise<Server>((resolve, reject) => {
    const s = app.listen(Number(config.port), config?.ip as string, () => {
      console.log(
        colors.italic.green.bold(`💫 Server running on http://${config?.ip}:${config.port}`),
      );
      resolve(s);
    });
    s.on('error', reject);
  });

const shutdown = (reason: string) => (err?: unknown) => {
  console.log(colors.red.bold(`😈 ${reason} detected, shutting down...`), err ?? '');
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

startSocket()
  .then(startHttpServer)
  .then((s) => {
    server = s;
  })
  .catch(shutdown('Startup error'));

process.on('unhandledRejection', shutdown('unhandledRejection'));
process.on('uncaughtException', shutdown('uncaughtException'));