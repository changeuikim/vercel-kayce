import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

// 모든 GraphQL 리졸버(Resolver)에서 공통적으로 접근할 수 있는 공유 데이터

export interface Context {
    prisma: PrismaClient; // Prisma 클라이언트
    user?: { id: string }; // 사용자 정보 (id만 포함)
}

// Context 생성 함수
export const createContext = (): Context => {
    return {
        prisma, // Prisma 클라이언트 전달
    };
};
