import { prisma } from '@/lib/db/prisma';
import {
    CreateUserInput,
    SafeUser,
    PaginationOptions,
    PaginatedUsers,
    UpdateUserInput,
} from '@/lib/db/user/types';
import { userSelectFields } from '@/lib/db/user/constants';
import crypto from 'crypto';
import { AppError, withErrorHandler } from '@/lib/db/common/errorHandlers';

export interface UserUtils {
    create(data: CreateUserInput): Promise<SafeUser>;
    findByProviderId(providerId: string): Promise<SafeUser | null>;
    update(id: string, data: UpdateUserInput): Promise<SafeUser>;
    softDelete(id: string): Promise<SafeUser>;
    restore(id: string): Promise<SafeUser>;
}

// providerIdHash 해시 생성 함수
const generateProviderIdHash = (providerId: string): string => {
    return crypto.createHash('sha256').update(providerId).digest('hex');
};

export const parseAndHashProviderId = (token: string): string => {
    if (!token || token.trim() === '') {
        throw new AppError('JWT token cannot be empty', 'BIZ_INVALID_JWT');
    }

    // TODO: 실제 JWT 파싱 로직 추가 (예: jsonwebtoken 라이브러리 사용)
    const decoded = token; // 가상의 파싱 결과
    const providerId = decoded; // 파싱된 provider ID (실제 키를 지정)

    return generateProviderIdHash(providerId);
};

export const userUtils: UserUtils = {
    create: async (data: CreateUserInput): Promise<SafeUser> => {
        return withErrorHandler(async () => {
            // providerIdHash 생성
            const providerIdHash = parseAndHashProviderId(data.providerId);

            return await prisma.$transaction(async (tx) => {
                // providerIdHash 중복 검사
                const existingUser = await tx.user.findFirst({
                    where: { providerIdHash },
                    select: { id: true },
                });

                // 중복 시 예외처리
                if (existingUser) {
                    throw new AppError(
                        `User with providerId "${data.providerId}" already exists.`,
                        'BIZ_DUPLICATE_PROVIDER'
                    );
                }

                // 사용자 생성
                return await tx.user.create({
                    data: {
                        provider: data.provider,
                        providerIdHash,
                        isDeleted: false,
                        deletedAt: null,
                    },
                    select: userSelectFields,
                });
            });
        });
    },
    findByProviderId: async (providerId: string): Promise<SafeUser | null> => {
        return withErrorHandler(async () => {
            // providerIdHash 생성
            const providerIdHash = parseAndHashProviderId(providerId);

            // Prisma를 사용하여 사용자 조회
            const user = await prisma.user.findFirst({
                where: { providerIdHash: providerIdHash, isDeleted: false },
                select: userSelectFields,
            });

            // 일치하는 사용자 없을시 null 반환
            if (!user) {
                return null;
            }

            return user;
        });
    },
    update: async (id: string, data: UpdateUserInput): Promise<SafeUser> => {
        // 실제 구현부는 나중에 작성
        return Promise.resolve({} as SafeUser);
    },
    softDelete: async (id: string): Promise<SafeUser> => {
        // 실제 구현부는 나중에 작성
        return Promise.resolve({} as SafeUser);
    },
    restore: async (id: string): Promise<SafeUser> => {
        // 실제 구현부는 나중에 작성
        return Promise.resolve({} as SafeUser);
    },
};
