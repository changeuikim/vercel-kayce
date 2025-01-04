import { userUtils, parseAndHashProviderId } from '@/lib/db/user/utils';
import { prisma } from '@/lib/db/prisma';
import { createTestUser } from '@/__tests__/helpers/user.helper';
import { AppError } from '@/lib/db/common/errorHandlers';

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
            new AppError(
                `User with providerId "${userData.providerId}" already exists.`,
                'BIZ_DUPLICATE_PROVIDER'
            )
        );
    });

    it('유효하지 않은 providerId로 유저 생성 시 예외를 발생시킨다', async () => {
        // given: providerIdHash가 빈 문자열인 사용자 데이터
        const userData = createTestUser({ providerId: '' });

        // when & then: 사용자 생성 시 예외 발생
        await expect(userUtils.create(userData)).rejects.toThrow(
            new AppError('JWT token cannot be empty', 'BIZ_INVALID_JWT')
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
