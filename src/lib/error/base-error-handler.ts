import { BaseErrorCode, BaseErrorMessages } from "@/lib/error/error-codes";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

export class BaseError extends Error {
  constructor(
    public readonly code: BaseErrorCode,
    public readonly meta?: Record<string, unknown>, // 동적 메시지 데이터를 포함
  ) {
    super(BaseError.formatMessage(code, meta)); // 메시지 생성 로직 추가
    this.name = "BaseError";
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  // 메시지 생성 로직
  private static formatMessage(
    code: BaseErrorCode,
    meta?: Record<string, unknown>,
  ): string {
    const template = BaseErrorMessages[code];
    if (!meta) return template; // 고정 메시지

    // 동적 메시지 처리 (e.g., 템플릿에서 변수 치환)
    return Object.entries(meta).reduce(
      (msg, [key, value]) => msg.replace(`\${${key}}`, String(value)),
      template,
    );
  }
}

function handlePrismaError(error: PrismaClientKnownRequestError): BaseError {
  switch (error.code) {
    case "P2002":
      return new BaseError("DB_UNIQUE_CONSTRAINT", error.meta);
    case "P2025":
      return new BaseError("DB_RECORD_NOT_FOUND", error.meta);
    default:
      return new BaseError("DB_VALIDATION_ERROR", error.meta);
  }
}

export async function withBaseErrorHandler<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof BaseError) throw error;
    if (error instanceof PrismaClientKnownRequestError)
      throw handlePrismaError(error);
    if (error instanceof PrismaClientValidationError)
      throw new BaseError("DB_VALIDATION_ERROR");
    throw new BaseError("SYS_UNKNOWN_ERROR", {
      originalError: error instanceof Error ? error.message : String(error),
    });
  }
}
