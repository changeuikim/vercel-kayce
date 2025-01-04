import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

// 에러 코드 정의
export type ErrorCode =
  // Database Errors
  | "DB_UNIQUE_CONSTRAINT"
  | "DB_RECORD_NOT_FOUND"
  | "DB_VALIDATION_ERROR"
  | "DB_TRANSACTION_FAILED"
  // Business Logic Errors
  | "BIZ_DUPLICATE_PROVIDER"
  | "BIZ_INVALID_JWT"
  | "BIZ_USER_NOT_FOUND"
  | "BIZ_UNAUTHORIZED"
  | "BIZ_INVALID_INPUT"
  // System Errors
  | "SYS_UNKNOWN_ERROR"
  | "SYS_NETWORK_ERROR"
  | "SYS_RUNTIME_ERROR";

// 커스텀 AppError 클래스
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: ErrorCode,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Prisma 에러 여부를 확인하는 타입 가드
function isPrismaKnownRequestError(
  error: unknown,
): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError;
}

function isPrismaValidationError(
  error: unknown,
): error is PrismaClientValidationError {
  return error instanceof PrismaClientValidationError;
}

// 에러 핸들러 함수
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // 이미 AppError라면 그대로 전파
    if (error instanceof AppError) {
      throw error;
    }

    // Prisma 에러 처리
    if (isPrismaKnownRequestError(error)) {
      switch (error.code) {
        case "P2002": // Unique constraint violation
          throw new AppError(
            "중복된 데이터가 존재합니다",
            "DB_UNIQUE_CONSTRAINT",
            error.meta,
          );
        case "P2025": // Record not found
          throw new AppError(
            "요청한 데이터를 찾을 수 없습니다",
            "DB_RECORD_NOT_FOUND",
            error.meta,
          );
        default:
          throw new AppError(
            "데이터베이스 오류가 발생했습니다",
            "DB_VALIDATION_ERROR",
            error.meta,
          );
      }
    }

    if (isPrismaValidationError(error)) {
      throw new AppError("데이터 유효성 검사 오류", "DB_VALIDATION_ERROR");
    }

    // 기타 예기치 못한 에러
    throw new AppError(
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
      "SYS_UNKNOWN_ERROR",
    );
  }
}
