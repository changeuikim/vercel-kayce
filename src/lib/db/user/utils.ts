import { prisma } from '@/lib/db/prisma';
import { CreateUserInput, SafeUser } from '@/lib/db/user/types';
import { userSelectFields } from '@/lib/db/user/constants';
import crypto from 'crypto';
import { BaseError, withBaseErrorHandler } from '@/lib/error/base-error-handler';

export interface UserUtils {
    create(data: CreateUserInput): Promise<SafeUser>;
    findByProviderId(providerId: string): Promise<SafeUser | null>;
    softDelete(id: string): Promise<SafeUser>;
    restore(id: string): Promise<SafeUser>;
}

// providerIdHash 해시 생성 함수
const generateProviderIdHash = (providerId: string): string => {
    return crypto.createHash('sha256').update(providerId).digest('hex');
};

export const parseAndHashProviderId = (token: string): string => {
    if (!token || token.trim() === '') {
        throw new BaseError('BIZ_INVALID_JWT');
    }

    // TODO: 실제 JWT 파싱 로직 추가 (예: jsonwebtoken 라이브러리 사용)
    const decoded = token; // 가상의 파싱 결과
    const providerId = decoded; // 파싱된 provider ID (실제 키를 지정)

    return generateProviderIdHash(providerId);
};

export const userUtils: UserUtils = {
    create: async (data: CreateUserInput): Promise<SafeUser> => {
        return withBaseErrorHandler(async () => {
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
                    throw new BaseError('BIZ_DUPLICATE_PROVIDER', { providerId: data.providerId });
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
        return withBaseErrorHandler(async () => {
            // providerIdHash 생성
            const providerIdHash = parseAndHashProviderId(providerId);

            // Prisma를 사용하여 사용자 조회
            const user = await prisma.user.findFirst({
                where: { providerIdHash: providerIdHash, isDeleted: false },
                select: userSelectFields,
            });

            return user;
        });
    },
    softDelete: async (id: string): Promise<SafeUser> => {
        return withBaseErrorHandler(async () => {
            return await prisma.$transaction(async (tx) => {
                // 사용자 조회
                const user = await tx.user.findUnique({
                    where: { id },
                    select: userSelectFields,
                });

                // 존재하지 않거나 이미 삭제된 사용자 예외 처리
                if (!user || user.isDeleted) {
                    throw new BaseError('BIZ_USER_NOT_FOUND', { id });
                }

                // 소프트 삭제 수행
                const deletedUser = await tx.user.update({
                    where: { id },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                    },
                    select: userSelectFields,
                });

                return deletedUser;
            });
        });
    },
    restore: async (id: string): Promise<SafeUser> => {
        return withBaseErrorHandler(async () => {
            return await prisma.$transaction(async (tx) => {
                // 사용자 조회
                const user = await tx.user.findUnique({
                    where: { id },
                    select: userSelectFields,
                });

                // 존재하지 않거나 활성 상태인 사용자 예외 처리
                if (!user || !user.isDeleted) {
                    throw new BaseError('BIZ_USER_NOT_FOUND', { id });
                }

                // 복구 수행
                const restoredUser = await tx.user.update({
                    where: { id },
                    data: {
                        isDeleted: false,
                        deletedAt: null,
                    },
                    select: userSelectFields,
                });

                return restoredUser;
            });
        });
    },
};
