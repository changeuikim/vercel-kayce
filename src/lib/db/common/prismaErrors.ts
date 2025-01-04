import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// 커스텀 Prisma 에러 클래스
export class PrismaErrorHandler extends Error {
    public readonly code?: string;
    public readonly meta?: Record<string, unknown>;

    constructor(message: string, code?: string, meta?: Record<string, unknown>) {
        super(message);
        this.name = 'PrismaError';
        this.code = code;
        this.meta = meta;

        Object.setPrototypeOf(this, PrismaErrorHandler.prototype);
    }
}

// 타입 가드: PrismaClientKnownRequestError 여부 확인
function isPrismaKnownRequestError(error: unknown): error is PrismaClientKnownRequestError {
    return error instanceof PrismaClientKnownRequestError;
}

// 타입 가드: PrismaClientValidationError 여부 확인
function isPrismaValidationError(error: unknown): error is PrismaClientValidationError {
    return error instanceof PrismaClientValidationError;
}

// Prisma 에러 핸들링 미들웨어
export async function withPrismaErrorHandler<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (isPrismaKnownRequestError(error)) {
            switch (error.code) {
                case 'P2002': // 고유 제약 조건 위반
                    throw new PrismaErrorHandler(
                        'Unique constraint violation',
                        error.code,
                        error.meta
                    );
                case 'P2025': // 레코드 없음
                    throw new PrismaErrorHandler('Record not found', error.code, error.meta);
                default:
                    throw new PrismaErrorHandler('Database error occurred', error.code, error.meta);
            }
        }

        if (isPrismaValidationError(error)) {
            throw new PrismaErrorHandler('Validation error', 'VALIDATION_ERROR');
        }

        throw new PrismaErrorHandler('Unexpected database error occurred');
    }
}
