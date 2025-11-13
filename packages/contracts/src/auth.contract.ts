import { z } from "zod";
import { CreateUserRequestSchema, CreateUserResponseSchema } from "./user.contract";

// Login contracts
export const LoginRequest = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  user: CreateUserResponseSchema,
  token: z.string(),
  refreshToken: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponse>;

// Register contracts (re-export from user contracts)
export const RegisterRequest = CreateUserRequestSchema;
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  user: CreateUserResponseSchema,
  token: z.string(),
  refreshToken: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

// Token refresh contracts
export const RefreshTokenRequest = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequest>;

export const RefreshTokenResponse = z.object({
  token: z.string(),
  refreshToken: z.string(),
});
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponse>;

// Forgot password contracts
export const ForgotPasswordRequest = z.object({
  email: z.string().email("Invalid email format"),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequest>;

// Reset password contracts
export const ResetPasswordRequest = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;
