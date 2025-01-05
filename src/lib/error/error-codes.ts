export const BaseErrorCodes = {
  DB_UNIQUE_CONSTRAINT: "DB_UNIQUE_CONSTRAINT",
  DB_RECORD_NOT_FOUND: "DB_RECORD_NOT_FOUND",
  DB_VALIDATION_ERROR: "DB_VALIDATION_ERROR",
  BIZ_DUPLICATE_PROVIDER: "BIZ_DUPLICATE_PROVIDER",
  BIZ_INVALID_JWT: "BIZ_INVALID_JWT",
  BIZ_USER_NOT_FOUND: "BIZ_USER_NOT_FOUND",
  SYS_UNKNOWN_ERROR: "SYS_UNKNOWN_ERROR",
} as const;

export type BaseErrorCode = keyof typeof BaseErrorCodes;

export const BaseErrorMessages: Record<BaseErrorCode, string> = {
  DB_UNIQUE_CONSTRAINT: "중복된 데이터가 존재합니다.",
  DB_RECORD_NOT_FOUND: "요청한 데이터를 찾을 수 없습니다.",
  DB_VALIDATION_ERROR: "데이터 유효성 검사 오류",
  BIZ_DUPLICATE_PROVIDER:
    'User with providerId "${providerId}" already exists.',
  BIZ_INVALID_JWT: "JWT token cannot be empty.",
  BIZ_USER_NOT_FOUND: 'User with id "${userId}" not found or already deleted.',
  SYS_UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
};
