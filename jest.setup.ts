import { prisma } from '@/lib/db/prisma';

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    // 단순히 모든 데이터를 삭제
    await prisma.jwtBlacklist.deleteMany();
    await prisma.user.deleteMany();
});
