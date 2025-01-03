import { PrismaClient } from '@prisma/client';
import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} from '@prisma/client/runtime/library';

// 전역 타입 선언: Node.js의 글로벌 객체에 prisma 인스턴스를 저장하기 위해 사용
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Prisma 인스턴스를 글로벌 객체에 저장 (싱글톤 패턴 구현)
// 이 전역 객체를 활용하여 핫 리로드 중에도 Prisma 클라이언트를 재사용
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined;
};

// Prisma 클라이언트 생성 및 환경별 로깅 설정
// - 개발 환경에서는 쿼리, 에러, 경고를 로깅
// - 프로덕션 환경에서는 에러만 로깅
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// 개발 환경에서만 글로벌 객체에 Prisma 클라이언트 저장
// 이를 통해 개발 중에 Prisma 클라이언트가 여러 번 초기화되는 문제 방지
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// 커스텀 에러 클래스 정의
// - Prisma 관련 에러를 처리하기 위한 표준 에러 클래스
export class PrismaErrorHandler extends Error {
    public readonly code?: string; // Prisma 에러 코드
    public readonly meta?: Record<string, unknown>; // Prisma 에러 메타데이터

    constructor(
        message: string, // 에러 메시지
        code?: string, // 에러 코드
        meta?: Record<string, unknown> // 추가 메타데이터
    ) {
        super(message);
        this.name = 'PrismaError';
        this.code = code;
        this.meta = meta;

        // Error 클래스의 프로토타입 체인을 명시적으로 설정
        Object.setPrototypeOf(this, PrismaErrorHandler.prototype);
    }
}

// 타입 가드 함수: PrismaClientKnownRequestError 여부 확인
// - Prisma에서 발생하는 알려진 요청 에러를 식별
function isPrismaKnownRequestError(error: unknown): error is PrismaClientKnownRequestError {
    return (
        error instanceof PrismaClientKnownRequestError ||
        (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            typeof (error as PrismaClientKnownRequestError).code === 'string')
    );
}

// 타입 가드 함수: PrismaClientValidationError 여부 확인
// - Prisma에서 발생하는 유효성 검사 에러를 식별
function isPrismaValidationError(error: unknown): error is PrismaClientValidationError {
    return (
        error instanceof PrismaClientValidationError ||
        (error instanceof Error && error.name === 'PrismaClientValidationError')
    );
}

// Prisma 에러 핸들링 미들웨어
// - Prisma 관련 비동기 작업에서 발생하는 에러를 처리
// - 알려진 Prisma 에러는 표준화된 에러로 변환
// - 알 수 없는 에러는 PrismaErrorHandler로 래핑
export async function withPrismaErrorHandler<T>(
    operation: () => Promise<T> // 비동기 작업
): Promise<T> {
    try {
        return await operation();
    } catch (error: unknown) {
        // 알려진 Prisma 요청 에러 처리
        if (isPrismaKnownRequestError(error)) {
            switch (error.code) {
                case 'P2002': {
                    // 고유 제약 조건 위반
                    throw new PrismaErrorHandler(
                        'Unique constraint violation',
                        error.code,
                        error.meta ?? undefined
                    );
                }
                case 'P2025': {
                    // 레코드 없음
                    throw new PrismaErrorHandler(
                        'Record not found',
                        error.code,
                        error.meta ?? undefined
                    );
                }
                default: {
                    // 기타 Prisma 에러
                    throw new PrismaErrorHandler(
                        'Database error occurred',
                        error.code,
                        error.meta ?? undefined
                    );
                }
            }
        }

        // 유효성 검사 에러 처리
        if (isPrismaValidationError(error)) {
            throw new PrismaErrorHandler('Validation error', 'VALIDATION_ERROR');
        }

        // 알 수 없는 에러를 PrismaErrorHandler로 래핑
        throw new PrismaErrorHandler(
            error instanceof Error ? error.message : 'Unexpected database error occurred'
        );
    }
}

export default prisma;
