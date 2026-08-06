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
exports.authServices = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const config_1 = __importDefault(require("../../config"));
const auth_utils_1 = require("./auth.utils");
const otpGenerator_1 = require("../../utils/otpGenerator");
const moment_1 = __importDefault(require("moment"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_models_1 = require("../user/user.models");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const mailSender_1 = require("../../utils/mailSender");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import firebaseAdmin from '../../utils/firebase';
// Login
const login = (payload, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const user = yield user_models_1.User.isUserExist(payload === null || payload === void 0 ? void 0 : payload.phoneNumber, payload === null || payload === void 0 ? void 0 : payload.email);
    if (!(user === null || user === void 0 ? void 0 : user.user)) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload.password, (_a = user === null || user === void 0 ? void 0 : user.user) === null || _a === void 0 ? void 0 : _a.password))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password does not match');
    }
    if (!((_c = (_b = user === null || user === void 0 ? void 0 : user.user) === null || _b === void 0 ? void 0 : _b.verification) === null || _c === void 0 ? void 0 : _c.status)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User account is not verified');
    }
    const jwtPayload = {
        userId: (_e = (_d = user === null || user === void 0 ? void 0 : user.user) === null || _d === void 0 ? void 0 : _d._id) === null || _e === void 0 ? void 0 : _e.toString(),
        role: (_f = user === null || user === void 0 ? void 0 : user.user) === null || _f === void 0 ? void 0 : _f.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    const ip = ((_g = req.headers['x-forwarded-for']) === null || _g === void 0 ? void 0 : _g.toString().split(',')[0]) ||
        req.socket.remoteAddress ||
        '';
    const userAgent = req.headers['user-agent'] || '';
    //@ts-ignore
    const parser = new ua_parser_js_1.default(userAgent);
    const result = parser.getResult();
    const data = Object.assign({ device: {
            ip: ip,
            browser: result.browser.name,
            os: result.os.name,
            device: result.device.model || 'Desktop',
            lastLogin: new Date().toISOString(),
        } }, (payload.fcmToken && { fcmToken: payload.fcmToken }));
    yield user_models_1.User.findByIdAndUpdate((_h = user === null || user === void 0 ? void 0 : user.user) === null || _h === void 0 ? void 0 : _h._id, data, {
        new: true,
        upsert: false,
    });
    return {
        user,
        accessToken,
        refreshToken,
    };
});
// Change password
const changePassword = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.IsUserExistId(id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!(yield user_models_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.oldPassword, user.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Old password does not match');
    }
    if ((payload === null || payload === void 0 ? void 0 : payload.newPassword) !== (payload === null || payload === void 0 ? void 0 : payload.confirmPassword)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New password and confirm password do not match');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield user_models_1.User.findByIdAndUpdate(id, {
        $set: {
            password: hashedPassword,
            passwordChangedAt: new Date(),
        },
    }, { new: true });
    return result;
});
// Forgot password
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.User.isUserExistEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user === null || user === void 0 ? void 0 : user.isDeleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const jwtPayload = {
        email: email,
        userId: user === null || user === void 0 ? void 0 : user._id,
    };
    const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: '3m',
    });
    const currentTime = new Date();
    const otp = (0, otpGenerator_1.generateOtp)();
    const expiresAt = (0, moment_1.default)(currentTime).add(3, 'minute');
    yield user_models_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, {
        needsPasswordChange: true,
        verification: {
            otp,
            expiresAt,
            status: true,
        },
    });
    const otpEmailPath = path_1.default.join(__dirname, '../../../../public/view/forgot_pass_mail.html');
    yield (0, mailSender_1.sendEmail)(user === null || user === void 0 ? void 0 : user.email, 'Your reset password OTP is', fs_1.default
        .readFileSync(otpEmailPath, 'utf8')
        .replace('{{otpCode}}', otp)
        .replace('{{fullName}}', user === null || user === void 0 ? void 0 : user.name)
        .replace('{{resetUrl}}', `${config_1.default.server_url}/auth/reset-password-page?token=${token}`.trim()));
    return { email, token };
});
// Reset password
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let decode;
    try {
        decode = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (err) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Session has expired. Please try again');
    }
    const user = yield user_models_1.User.findById(decode === null || decode === void 0 ? void 0 : decode.userId).select('isDeleted verification');
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (new Date() > ((_a = user === null || user === void 0 ? void 0 : user.verification) === null || _a === void 0 ? void 0 : _a.expiresAt)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Session has expired');
    }
    if (!((_b = user === null || user === void 0 ? void 0 : user.verification) === null || _b === void 0 ? void 0 : _b.status)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'OTP is not verified yet');
    }
    if ((payload === null || payload === void 0 ? void 0 : payload.newPassword) !== (payload === null || payload === void 0 ? void 0 : payload.confirmPassword)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'New password and confirm password do not match');
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield user_models_1.User.findByIdAndUpdate(decode === null || decode === void 0 ? void 0 : decode.userId, {
        password: hashedPassword,
        needsPasswordChange: false,
        passwordChangedAt: new Date(),
        verification: {
            otp: 0,
            status: true,
        },
    });
    return result;
});
// Refresh token
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Checking if the given token is valid
    const decoded = (0, auth_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { userId } = decoded;
    const user = yield user_models_1.User.IsUserExistId(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const isDeleted = user === null || user === void 0 ? void 0 : user.isDeleted;
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted');
    }
    const jwtPayload = {
        userId: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString(),
        role: user.role,
    };
    const accessToken = (0, auth_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
// const googleLogin = async (payload: any, req: Request) => {
//   try {
//     const decodedToken: DecodedIdToken | null = await firebaseAdmin
//       .auth()
//       .verifyIdToken(payload?.token);
//     console.log(JSON.stringify(decodedToken));
//     if (!decodedToken)
//       throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token');
//     if (!decodedToken?.email_verified) {
//       throw new AppError(
//         httpStatus?.BAD_REQUEST,
//         'your mail not verified from google',
//       );
//     }
//     const isExist: IUser | null = await User.isUserExist(
//       decodedToken.email as string,
//     );
//     if (isExist) {
//       if (isExist?.status !== 'active')
//         throw new AppError(httpStatus.FORBIDDEN, 'This account is Blocked');
//       // Login_With.credentials ||
//       if (isExist?.loginWth === (Login_With.facebook || Login_With.apple))
//         throw new AppError(
//           httpStatus.FORBIDDEN,
//           `This account in not registered with google login. try it ${isExist?.loginWth}`,
//         );
//       if (isExist?.isDeleted)
//         throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
//       if (!isExist?.verification?.status) {
//         throw new AppError(
//           httpStatus.FORBIDDEN,
//           'User account is not verified',
//         );
//       }
//       const jwtPayload: { userId: string; role: string } = {
//         userId: isExist?._id?.toString() as string,
//         role: isExist?.role,
//       };
//       const accessToken = createToken(
//         jwtPayload,
//         config.jwt_access_secret as string,
//         config.jwt_access_expires_in as string,
//       );
//       const refreshToken = createToken(
//         jwtPayload,
//         config.jwt_refresh_secret as string,
//         config.jwt_refresh_expires_in as string,
//       );
//       if (isExist) {
//         const ip =
//           req.headers['x-forwarded-for']?.toString().split(',')[0] ||
//           req.socket.remoteAddress ||
//           '';
//         const userAgent = req.headers['user-agent'] || '';
//         //@ts-ignore
//         const parser = new UAParser(userAgent);
//         const result = parser.getResult();
//         const device = {
//           ip: ip,
//           browser: result.browser.name,
//           os: result.os.name,
//           device: result.device.model || 'Desktop',
//           lastLogin: new Date().toISOString(),
//         };
//         await User.findByIdAndUpdate(
//           isExist?._id,
//           { device },
//           { new: true, upsert: false },
//         );
//       }
//       return {
//         user: isExist,
//         accessToken,
//         refreshToken,
//       };
//     }
//     const user = await User.create({
//       name: decodedToken?.name,
//       email: decodedToken?.email,
//       profile: decodedToken?.picture,
//       expireAt: null,
//       phoneNumber: decodedToken?.phone_number,
//       role: payload?.role ?? USER_ROLE.user,
//       loginWth: Login_With.google,
//       'verification.status': true,
//     });
//     if (!user)
//       throw new AppError(
//         httpStatus?.BAD_REQUEST,
//         'user account creation failed',
//       );
//     const jwtPayload: { userId: string; role: string } = {
//       userId: user?._id?.toString() as string,
//       role: user?.role,
//     };
//     const accessToken = createToken(
//       jwtPayload,
//       config.jwt_access_secret as string,
//       config.jwt_access_expires_in as string,
//     );
//     const refreshToken = createToken(
//       jwtPayload,
//       config.jwt_refresh_secret as string,
//       config.jwt_refresh_expires_in as string,
//     );
//     if (isExist) {
//       const ip =
//         req.headers['x-forwarded-for']?.toString().split(',')[0] ||
//         req.socket.remoteAddress ||
//         '';
//       const userAgent = req.headers['user-agent'] || '';
//       //@ts-ignore
//       const parser = new UAParser(userAgent);
//       const result = parser.getResult();
//       const data = {
//         device: {
//           ip: ip,
//           browser: result.browser.name,
//           os: result.os.name,
//           device: result.device.model || 'Desktop',
//           lastLogin: new Date().toISOString(),
//         },
//       };
//       await User.findByIdAndUpdate(user?._id, data, {
//         new: true,
//         upsert: false,
//       });
//     }
//     return {
//       user: user,
//       accessToken,
//       refreshToken,
//     };
//   } catch (error: any) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       error?.message ?? 'Login failed Server Error',
//     );
//   }
// };
const resetPasswordLink = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decode;
    try {
        decode = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (err) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Session has expired. Please try again');
    }
    const user = yield user_models_1.User.findById(decode === null || decode === void 0 ? void 0 : decode.userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!user.needsPasswordChange) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are already reset your password');
    }
    return;
});
exports.authServices = {
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,
    // googleLogin,
    resetPasswordLink,
};
