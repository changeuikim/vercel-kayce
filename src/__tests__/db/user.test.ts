import { userUtils, parseAndHashProviderId } from '@/lib/db/user/utils';
import { prisma } from '@/lib/db/prisma';
import { createTestUser, createTestUsers } from '@/__tests__/helpers/user.helper';
import { PrismaErrorHandler } from '@/lib/db/common/prismaErrors';

// # 테스트 데이터베이스 준비
// npx prisma migrate reset --force --preview-feature

// # 테스트 실행
// npm run test

describe('userUtils.create', () => {
    it('정상적으로 유저를 생성한다', async () => {
        // given: 테스트 사용자 데이터 준비
        const userData = createTestUser({ providerId: 'testProviderId' });

        // when: 사용자를 생성
        const user = await userUtils.create(userData);

        // then: 생성된 사용자가 올바른 속성을 가지는지 확인
        const expectedHash = parseAndHashProviderId(userData.providerId);
        expect(user).toMatchObject({
            provider: userData.provider,
            providerIdHash: expectedHash,
            isDeleted: false,
            deletedAt: null,
        });
        expect(user).toHaveProperty('id');
    });

    it('중복 providerId로 유저 생성 시 예외를 발생시킨다', async () => {
        // given: 테스트 사용자 데이터 준비
        const userData = createTestUser({ providerId: 'testProviderId' });
        await userUtils.create(userData);

        // when & then: 동일한 providerId로 사용자 생성 시도 → 예외 발생
        await expect(userUtils.create(userData)).rejects.toThrow(
            new PrismaErrorHandler(
                `User with providerId "${userData.providerId}" already exists.`,
                'DUPLICATE_PROVIDER_ID'
            )
        );
    });

    it('유효하지 않은 providerId로 유저 생성 시 예외를 발생시킨다', async () => {
        // given: providerIdHash가 빈 문자열인 사용자 데이터
        const userData = createTestUser({ providerId: '' });

        // when & then: 사용자 생성 시 예외 발생
        await expect(userUtils.create(userData)).rejects.toThrow(
            new PrismaErrorHandler('JWT token cannot be empty', 'INVALID_JWT')
        );
    });
});

describe('userUtils.findByProviderId', () => {
    beforeEach(async () => {
        // 테스트 전에 데이터베이스 초기화
        await prisma.user.deleteMany();
    });

    it('정상적으로 유저를 조회한다', async () => {
        // given: providerId로 사용자 생성
        const userData = createTestUser({ providerId: 'testProviderId' });
        await userUtils.create(userData);

        // when: 유저를 조회
        const user = await userUtils.findByProviderId(userData.providerId);

        // then: 조회된 유저가 기대한 속성을 가지는지 확인
        expect(user).toMatchObject({
            provider: userData.provider,
            isDeleted: false,
            deletedAt: null,
        });
        expect(user).toHaveProperty('id'); // ID 확인
    });

    it('존재하지 않는 providerIdHash로 조회 시 null을 반환한다', async () => {
        // given: 존재하지 않는 providerIdHash
        const nonExistentProviderId = 'nonexistent';

        // when: 유저를 조회
        const user = await userUtils.findByProviderId(nonExistentProviderId);

        // then: null을 반환해야 함
        expect(user).toBeNull();
    });

    it('유효하지 않은 providerIdHash로 조회 시 예외를 발생시킨다', async () => {
        // given: 유효하지 않은 providerIdHash
        const invalidProviderId = '';

        // when & then: 조회 시 예외 발생
        await expect(userUtils.findByProviderId(invalidProviderId)).rejects.toThrow(
            'JWT token cannot be empty'
        );
    });
});

describe('userUtils.findMany', () => {
    it('정상적으로 페이지네이션된 유저 목록을 반환한다', async () => {
        // given: 여러 사용자를 생성
        const { users } = await createTestUsers(15, 'user');
        await Promise.all(users.map((userData) => userUtils.create(userData)));

        const page = 2;
        const limit = 5;

        // when: 두 번째 페이지 요청
        const result = await userUtils.findMany({ page, limit });

        // then: 페이지네이션된 결과 확인
        expect(result.users.length).toBe(limit);
        expect(result.total).toBe(15);
        expect(result.page).toBe(page);
        expect(result.limit).toBe(limit);
        expect(result.totalPages).toBe(Math.ceil(15 / limit));
    });

    it('비어 있는 데이터베이스에서 호출하면 빈 목록을 반환한다', async () => {
        // when: findMany 호출
        const result = await userUtils.findMany();

        // then: 빈 결과 반환 확인
        expect(result.users.length).toBe(0);
        expect(result.total).toBe(0);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
        expect(result.totalPages).toBe(0);
    });

    it('반환된 사용자 ID가 예상된 ID와 동일해야 한다', async () => {
        // given: 여러 사용자를 생성
        const { users, hashedIds } = await createTestUsers(15, 'user');
        await Promise.all(users.map((userData) => userUtils.create(userData))); // 사용자 생성

        // when: findMany 호출
        const result = await userUtils.findMany({ limit: 15 });

        // then: 반환된 해시된 ID와 예상된 해시된 ID 비교
        const resultIds = result.users.map((user) => user.providerIdHash).sort();
        const expectedIds = [...hashedIds].sort();

        expect(resultIds).toEqual(expectedIds);
    });
});
