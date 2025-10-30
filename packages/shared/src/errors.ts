// /packages/shared/src/errors.ts

export type AppErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DOMAIN_RULE"
  | "INFRA"
  | "UNKNOWN";

export interface AppErrorProps<D = unknown> {
  code: AppErrorCode;
  message: string;
  details?: D;
  cause?: unknown;
}

export class AppError<D = unknown> extends Error {
  public readonly code: AppErrorCode;
  public readonly details?: D;
  public readonly cause?: unknown;

  constructor(props: AppErrorProps<D>) {
    super(props.message);
    this.name = "AppError";
    this.code = props.code;
    this.details = props.details;
    this.cause = props.cause;

    // Mantiene stack trace
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError);
  }
}

/** Factories cortas */
export const validationError = <D = unknown>(message: string, details?: D, cause?: unknown) =>
  new AppError<D>({ code: "VALIDATION", message, details, cause });

export const notFound = <D = unknown>(message: string, details?: D, cause?: unknown) =>
  new AppError<D>({ code: "NOT_FOUND", message, details, cause });

export const conflict = <D = unknown>(message: string, details?: D, cause?: unknown) =>
  new AppError<D>({ code: "CONFLICT", message, details, cause });

export const unauthorized = <D = unknown>(message = "Unauthorized", details?: D, cause?: unknown) =>
  new AppError<D>({ code: "UNAUTHORIZED", message, details, cause });

export const forbidden = <D = unknown>(message = "Forbidden", details?: D, cause?: unknown) =>
  new AppError<D>({ code: "FORBIDDEN", message, details, cause });

export const domainRuleError = <D = unknown>(message: string, details?: D, cause?: unknown) =>
  new AppError<D>({ code: "DOMAIN_RULE", message, details, cause });

export const infraError = <D = unknown>(message: string, details?: D, cause?: unknown) =>
  new AppError<D>({ code: "INFRA", message, details, cause });

export const unknownError = <D = unknown>(message = "Unknown error", details?: D, cause?: unknown) =>
  new AppError<D>({ code: "UNKNOWN", message, details, cause });

/** Mapeo opcional a HTTP status para capa Interfaces */
export function toHttpStatus(code: AppErrorCode): number {
  switch (code) {
    case "VALIDATION": return 400;
    case "UNAUTHORIZED": return 401;
    case "FORBIDDEN": return 403;
    case "NOT_FOUND": return 404;
    case "CONFLICT": return 409;
    case "DOMAIN_RULE": return 422;
    case "INFRA": return 503;
    default: return 500;
  }
}
