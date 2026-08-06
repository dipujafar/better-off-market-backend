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
exports.sendNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const http_status_1 = __importDefault(require("http-status"));
const firebase_json_1 = __importDefault(require("../firebase/firebase.json"));
const AppError_1 = __importDefault(require("../error/AppError"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(firebase_json_1.default),
});
const sendNotification = (fcmToken, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('sending message');
    try {
        const response = yield firebase_admin_1.default.messaging().sendEachForMulticast({
            tokens: fcmToken,
            notification: {
                title: payload.message,
                body: payload.description,
            },
            apns: {
                headers: {
                    'apns-push-type': 'alert',
                },
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        });
        console.log(response === null || response === void 0 ? void 0 : response.responses, 'from send notification');
        return response;
    }
    catch (error) {
        console.error('Error sending message:', error);
        if ((error === null || error === void 0 ? void 0 : error.code) === 'messaging/third-party-auth-error') {
            return null;
        }
        else {
            console.error('Error sending message:', error);
            throw new AppError_1.default(http_status_1.default.NOT_IMPLEMENTED, error.message || 'Failed to send notification');
        }
    }
});
exports.sendNotification = sendNotification;
