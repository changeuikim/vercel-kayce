import { prisma } from '@/lib/db/prisma';

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    // 테스트 데이터 초기화
    await prisma.user.deleteMany();
    await prisma.userJwtBlacklist.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.adminJwtBlacklist.deleteMany();
});
