import { userUtils, parseAndHashProviderId } from '@/lib/db/user/utils';
import { prisma } from '@/lib/db/prisma';
import { createTestUser } from '@/__tests__/helpers/user.helper';
import { PrismaErrorHandler } from '@/lib/db/common/prismaErrors';

// # 테스트 데이터베이스 준비
// npx prisma migrate reset --force --preview-feature

// # 테스트 실행
// npm run test

describe('userUtils.create', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    it('정상적으로 유저를 생성한다', async () => {
        // given: 테스트 사용자 데이터 준비
        const userData = createTestUser({ providerId: 'testProviderId' });
        const hashedProviderId = parseAndHashProviderId(userData.providerId);

        // when: 사용자를 생성
        const user = await userUtils.create(userData);

        // then: 생성된 사용자가 올바른 속성을 가지는지 확인
        expect(user).toMatchObject({
            provider: userData.provider,
            providerIdHash: hashedProviderId, // 해시된 값으로 비교
            isDeleted: false,
            deletedAt: null,
        });
        expect(user).toHaveProperty('id');
    });

    it('중복 providerIdHash로 유저 생성 시 예외를 발생시킨다', async () => {
        // given: 동일한 providerIdHash를 가진 사용자 생성
        const userData = createTestUser({ providerId: 'testProviderId' });
        const hashedProviderId = parseAndHashProviderId(userData.providerId);

        await userUtils.create(userData);

        // when & then: 동일한 providerIdHash로 사용자 생성 시도 → 예외 발생
        await expect(userUtils.create(userData)).rejects.toThrow(
            new PrismaErrorHandler(
                `User with providerIdHash "${hashedProviderId}" already exists.`,
                'DUPLICATE_PROVIDER_ID'
            )
        );
    });

    it('유효하지 않은 providerIdHash로 유저 생성 시 예외를 발생시킨다', async () => {
        // given: providerIdHash가 빈 문자열인 사용자 데이터
        const userData = createTestUser({ providerId: '' });

        // when & then: 사용자 생성 시 예외 발생
        await expect(userUtils.create(userData)).rejects.toThrow(
            new PrismaErrorHandler('JWT token cannot be empty', 'INVALID_JWT')
        );
    });
});
