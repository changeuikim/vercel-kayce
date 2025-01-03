// src/lib/db/user.ts

import bcrypt from 'bcryptjs'; // 비밀번호 해시화를 위한 bcrypt
import { prisma } from './prisma'; // Prisma 클라이언트
import { userSelectFields } from './constants'; // 공통적으로 사용되는 필드 정의
import { handlePrismaError, PrismaCustomError } from './errors'; // 에러 핸들링
import type {
    CreateUserInput,
    UpdateUserInput,
    SafeUser,
    UserFindOptions,
    PaginationOptions,
    PaginatedUsers,
} from './types/user';

const SALT_ROUNDS = 10; // 비밀번호 해시화를 위한 솔트

export const userUtils = {
    /**
     * 비밀번호 해시화 함수
     * - 비밀번호를 안전하게 저장하기 위해 해시화
     */
    hashPassword: async (password: string): Promise<string> => {
        try {
            return await bcrypt.hash(password, SALT_ROUNDS);
        } catch (error) {
            throw new Error('비밀번호 해시화 중 오류가 발생했습니다.');
        }
    },

    /**
     * 이메일을 기준으로 사용자 조회
     * - 소프트 삭제된 데이터는 기본적으로 제외
     * @param email - 사용자 이메일
     * @param options - 삭제된 사용자 포함 여부
     * @returns SafeUser 또는 null
     */
    findByEmail: async (email: string, options: UserFindOptions = {}): Promise<SafeUser | null> => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                    isDeleted: options.includeDeleted ? undefined : false,
                },
                select: userSelectFields,
            });

            return user as SafeUser | null;
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 아이디를 기준으로 사용자 조회
     * - 소프트 삭제된 데이터는 기본적으로 제외
     * @param id - 사용자 아이디
     * @param options - 삭제된 사용자 포함 여부
     * @returns SafeUser 또는 null
     */
    findById: async (id: string, options: UserFindOptions = {}): Promise<SafeUser | null> => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id,
                    isDeleted: options.includeDeleted ? undefined : false,
                },
                select: userSelectFields,
            });

            return user as SafeUser | null;
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 새 사용자 생성 with 트랜잭션
     * - 이메일 중복 검사 후 사용자 생성
     * - 비밀번호가 제공되면 해시화 후 저장
     * @param data - 사용자 생성에 필요한 데이터
     * @returns 생성된 SafeUser
     */
    create: async (data: CreateUserInput): Promise<SafeUser> => {
        try {
            return await prisma.$transaction(async (tx) => {
                // 중복 이메일 검사
                const existingUser = await tx.user.findFirst({
                    where: { email: data.email, isDeleted: false },
                    select: { id: true },
                });

                if (existingUser) {
                    throw new PrismaCustomError('DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.');
                }

                // 비밀번호 해시화
                const hashedPassword = data.password
                    ? await userUtils.hashPassword(data.password)
                    : null;

                const user = await tx.user.create({
                    data: {
                        ...data,
                        password: hashedPassword,
                    },
                    select: userSelectFields,
                });

                return user as SafeUser;
            });
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 사용자 정보 업데이트
     * - 비밀번호가 제공되면 해시화 후 업데이트
     * @param id - 업데이트할 사용자 ID
     * @param data - 업데이트할 데이터
     * @returns 업데이트된 SafeUser
     */
    update: async (id: string, data: UpdateUserInput): Promise<SafeUser> => {
        try {
            const updateData = { ...data };
            if (updateData.password) {
                updateData.password = await userUtils.hashPassword(updateData.password);
            }

            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: userSelectFields,
            });

            return user as SafeUser;
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 사용자 소프트 삭제
     * - isDeleted 필드를 true로 설정하고 삭제 시간 기록
     * @param id - 삭제할 사용자 ID
     * @returns 삭제된 SafeUser
     */
    softDelete: async (id: string): Promise<SafeUser> => {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
                select: userSelectFields,
            });

            return user as SafeUser;
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 사용자 상태 업데이트
     * @param id - 업데이트할 사용자 ID
     * @returns 업데이트된 SafeUser
     */
    updateStatus: async (id: string, status: SafeUser['status']): Promise<SafeUser> => {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: { status },
                select: userSelectFields,
            });

            return user as SafeUser;
        } catch (error) {
            return handlePrismaError(error);
        }
    },

    /**
     * 페이지네이션된 사용자 목록 조회
     * - 정렬, 페이지 번호, 제한 수를 설정하여 조회
     * @param options - 페이지네이션 옵션
     * @returns PaginatedUsers 객체
     */
    findMany: async (options: PaginationOptions = {}): Promise<PaginatedUsers> => {
        const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;

        try {
            const skip = (page - 1) * limit;

            const [users, total] = await prisma.$transaction([
                prisma.user.findMany({
                    where: { isDeleted: false },
                    select: userSelectFields,
                    skip,
                    take: limit,
                    orderBy,
                }),
                prisma.user.count({ where: { isDeleted: false } }),
            ]);

            return {
                users: users as SafeUser[],
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                cacheKey: `users_p${page}_l${limit}_${JSON.stringify(orderBy)}`,
            };
        } catch (error) {
            return handlePrismaError(error);
        }
    },
};

export default userUtils;
