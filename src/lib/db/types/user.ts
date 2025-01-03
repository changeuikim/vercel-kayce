import type { User } from '@prisma/client';

// 유저 생성 시 필요한 데이터 타입
export type CreateUserInput = {
    email: string;
    password?: string | null;
    name?: string | null;
    provider?: User['provider'];
    providerId?: string | null;
    status?: User['status'];
    role?: User['role'];
};

// 유저 업데이트 시 필요한 데이터 타입
export type UpdateUserInput = Partial<CreateUserInput>;

// 비밀번호를 제외한 안전한 유저 정보 타입
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

// 유저 조회 옵션
export type UserFindOptions = {
    includeDeleted?: boolean;
};

// 페이지네이션 옵션
export type PaginationOptions = {
    page?: number;
    limit?: number;
    orderBy?: {
        [K in keyof User]?: 'asc' | 'desc';
    };
};

// 조회 결과 타입
export type PaginatedUsers = {
    users: SafeUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    cacheKey: string;
};

// DB 에러 타입
export type DBError = {
    code: string;
    message: string;
    meta?: Record<string, unknown>;
};
