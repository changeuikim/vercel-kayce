import { AuthProvider, User } from '@prisma/client';
import { userSelectFields } from './constants';

// 유저 생성 시 필요한 데이터 타입
export type CreateUserInput = {
    provider: AuthProvider; // 인증 공급자 (GITHUB, GOOGLE 등)
    providerId: string; // 해시 전 공급자 ID
};

// 비밀번호를 제외한 안전한 유저 정보 타입
export type SafeUser = {
    [K in keyof UserSelectFields]: K extends keyof User ? User[K] : never;
};

// SafeUser 타입 동기화
export type UserSelectFields = typeof userSelectFields;

// 페이지네이션 옵션
export type PaginationOptions = {
    page?: number;
    limit?: number;
    orderBy?: {
        [key: string]: 'asc' | 'desc';
    };
};

// 조회 결과 타입
export type PaginatedUsers = {
    users: SafeUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

// 유저 업데이트 시 필요한 데이터 타입
export type UpdateUserInput = Partial<CreateUserInput>;

// 사용자 조회 결과 타입
export type UserFindOptions = {
    includeDeleted?: boolean;
};
