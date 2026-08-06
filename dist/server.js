"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
// Force Google DNS servers before any connection attempt
dns_1.default.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dns_1.default.setDefaultResultOrder('ipv4first');
/* eslint-disable @typescript-eslint/ban-ts-comment */
const http_1 = require("http");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const defaultTask_1 = require("./app/utils/defaultTask");
const colors_1 = __importDefault(require("colors"));
let server;
const socketServer = (0, http_1.createServer)(app_1.default);
let currentPort = Number(config_1.default.port) | 5000;
let portCount = 0;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.database_url);
            (0, defaultTask_1.defaultTask)();
            server = app_1.default.listen(Number(currentPort), config_1.default.ip, () => {
                console.log(colors_1.default.italic.green.bold(`💫 Simple Server Listening on  http://${config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.ip}:${currentPort} `));
            });
            // server.on('error', (err: any) => {
            //   if (err.code === 'EADDRINUSE') {
            //     console.warn(
            //       colors.yellow(
            //         `⚠️  Port ${currentPort} is in use. Trying next port...`,
            //       ),
            //     );
            //     if (portCount < 10) {
            //       currentPort++;
            //       portCount++;
            //       main(); // retry with next port
            //     } else {
            //       console.error(
            //         colors.red('❌ Max retries reached. Could not start server.'),
            //       );
            //       process.exit(1);
            //     }
            //   } else {
            //     console.error('❌ Server error:', err);
            //     process.exit(1);
            //   }
            // });
            // global.socketio = io;
        }
        catch (err) {
            console.error(err);
        }
    });
}
main();
// const urlLauncher = (url: string) => {
//   const platform = process.platform;
//   let command = '';
//   if (platform === 'win32') {
//     command = `start ${url}`;
//   } else if (platform === 'darwin') {
//     command = `open ${url}`;
//   } else {
//     command = `xdg-open ${url}`;
//   }
//   exec(command, err => {
//     if (err) {
//       console.error('🚫 Failed to open browser automatically:', err);
//     }
//   });
// };
process.on('unhandledRejection', err => {
    console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', () => {
    console.log(`😈 uncaughtException is detected , shutting down ...`);
    process.exit(1);
});
