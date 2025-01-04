import { prisma } from '@/lib/db/prisma';

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    // 테스트 데이터 초기화
    await prisma.userJwtBlacklist.deleteMany(); // 수정된 부분
    await prisma.adminJwtBlacklist.deleteMany(); // 관리자용 JWT 블랙리스트
    await prisma.user.deleteMany();
    await prisma.admin.deleteMany(); // 관리자 테이블 초기화
});
