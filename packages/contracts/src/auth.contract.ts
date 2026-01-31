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
// Sprint #15 - Task 2.4: Password Recovery Flow
export const ForgotPasswordRequest = z.object({
  email: z
    .string()
    .email("El formato del email es inválido")
    .toLowerCase() // Normalizar a minúsculas
    .trim(), // Remover espacios en blanco
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequest>;

export const ForgotPasswordResponse = z.object({
  message: z.string(), // Mensaje genérico (security best practice)
});
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponse>;

// Reset password contracts
// Sprint #15 - Task 2.4: Password Recovery Flow
// Password strength validation: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
export const ResetPasswordRequest = z.object({
  token: z
    .string()
    .min(1, "El token es requerido")
    .trim(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña no puede exceder 128 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;

export const ResetPasswordResponse = z.object({
  message: z.string(), // Mensaje de confirmación
});
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponse>;
