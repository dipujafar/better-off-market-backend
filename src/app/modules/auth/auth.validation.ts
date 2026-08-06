import { z } from 'zod';
import { Role, USER_ROLE } from '../user/user.constants';

export const loginZodValidationSchema = z.object({
  body: z
    .object({
      phoneNumber: z.string().optional(),
      email: z.string().email('Invalid email format!').optional(),
      fcmToken: z.string().optional(),
      password: z.string({
        required_error: 'Password is required!',
      }),
    })
    .superRefine((data, ctx) => {
      if (!data.phoneNumber && !data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Either phone number or email is required!',
          path: ['phoneNumber'],
        });
      }
    }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const googleLogin = z.object({
  body: z.object({
    token: z.string({
      required_error: 'Token is Required',
    }),
  }),
  role: z.enum([...Role] as [string, ...string[]]).default(USER_ROLE.user),
});

export const authValidation = {
  refreshTokenValidationSchema,
  loginZodValidationSchema,
  googleLogin,
};
