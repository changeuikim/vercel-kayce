import { PrismaClient } from '@prisma/client';

// 전역 Prisma 클라이언트 설정
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Prisma 클라이언트를 싱글톤으로 생성
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

// 개발 환경에서는 글로벌 객체에 Prisma 클라이언트를 저장
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
