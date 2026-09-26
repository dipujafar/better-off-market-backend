"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = exports.loginZodValidationSchema = void 0;
const zod_1 = require("zod");
const user_constants_1 = require("../user/user.constants");
exports.loginZodValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: zod_1.z.string().email('Invalid email format!'),
        fcmToken: zod_1.z.string().optional(),
        password: zod_1.z.string({
            required_error: 'Password is required!',
        }),
    })
});
const refreshTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({
            required_error: 'Refresh token is required!',
        }),
    }),
});
const googleLogin = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string({
            required_error: 'Token is Required',
        }),
    }),
    role: zod_1.z.enum([...user_constants_1.Role]).default(user_constants_1.USER_ROLE.user),
});
exports.authValidation = {
    refreshTokenValidationSchema,
    loginZodValidationSchema: exports.loginZodValidationSchema,
    googleLogin,
};
