import { prisma } from "@/lib/db/prisma";
import {
  CreateUserInput,
  SafeUser,
  UserFindOptions,
  UserFindResult,
} from "@/lib/db/user/types";
import { userSelectFields } from "@/lib/db/user/constants";
import crypto from "crypto";
import {
  BaseError,
  withBaseErrorHandler,
} from "@/lib/error/base-error-handler";
import { Prisma } from "@prisma/client";

export interface UserUtils {
  create(data: CreateUserInput): Promise<SafeUser>;
  findByProviderId(providerId: string): Promise<SafeUser | null>;
  findMany(options: UserFindOptions): Promise<UserFindResult>;
  softDelete(id: string): Promise<SafeUser>;
  restore(id: string): Promise<SafeUser>;
}

// providerIdHash 해시 생성 함수
const generateProviderIdHash = (providerId: string): string => {
  return crypto.createHash("sha256").update(providerId).digest("hex");
};

export const parseAndHashProviderId = (token: string): string => {
  if (!token || token.trim() === "") {
    throw new BaseError("BIZ_INVALID_JWT");
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
          throw new BaseError("BIZ_DUPLICATE_PROVIDER", {
            providerId: data.providerId,
          });
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
  findMany: async (options: UserFindOptions): Promise<UserFindResult> => {
    return withBaseErrorHandler(async () => {
      const { filter, sort, pagination } = options;

      // 1. Prisma where 조건 생성
      const where: Prisma.UserWhereInput = {};
      if (filter) {
        // isDeleted 조건
        if (filter.isDeleted !== undefined) {
          where.isDeleted = filter.isDeleted;
        }

        // createdAt 날짜 범위
        if (filter.createdAt) {
          where.createdAt = {
            ...(filter.createdAt.lte && {
              lte: new Date(filter.createdAt.lte),
            }),
            ...(filter.createdAt.gte && {
              gte: new Date(filter.createdAt.gte),
            }),
          };
        }

        // deletedAt 날짜 범위
        if (filter.deletedAt) {
          where.deletedAt = {
            ...(filter.deletedAt.lte && {
              lte: new Date(filter.deletedAt.lte),
            }),
            ...(filter.deletedAt.gte && {
              gte: new Date(filter.deletedAt.gte),
            }),
          };
        }

        // AND/OR 조건
        if (filter.AND) {
          where.AND = filter.AND.map((andFilter) => ({
            ...andFilter,
          }));
        }
        if (filter.OR) {
          where.OR = filter.OR.map((orFilter) => ({
            ...orFilter,
          }));
        }
      }

      // 2. 정렬 조건 생성
      const orderBy = sort?.map((s) => ({
        [s.field]: s.direction,
      }));

      // 3. 페이지네이션 옵션 생성
      const { take, skip, cursor } = pagination || {};
      const paginationArgs: Prisma.UserFindManyArgs = {
        where, // 필터 조건
        orderBy, // 정렬 조건
        take: take ? take + 1 : undefined, // 가져올 데이터 수
        skip, // 건너뛸 데이터 수
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1, // 현재 커서 다음부터
        }),
      };

      // 4. 데이터 조회
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          ...paginationArgs,
          select: userSelectFields,
        }),
        prisma.user.count({ where }),
      ]);

      // 5. 페이지네이션 여부 계산
      // 결과 반환 전에 추가 데이터 제거
      let hasNextPage = false;
      if (take && users.length > take) {
        hasNextPage = true;
        users.pop(); // 추가로 가져온 데이터 제거
      }

      return {
        users,
        totalCount,
        hasNextPage,
      };
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
          throw new BaseError("BIZ_USER_NOT_FOUND", { id });
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
          throw new BaseError("BIZ_USER_NOT_FOUND", { id });
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
