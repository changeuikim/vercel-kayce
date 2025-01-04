import { userUtils, parseAndHashProviderId } from '@/lib/db/user/utils';
import { prisma } from '@/lib/db/prisma';
import { createTestUser } from '@/__tests__/helpers/user.helper';
import { BaseError } from '@/lib/error/base-error-handler';

// # 테스트 데이터베이스 준비
// npx prisma migrate reset --force --preview-feature

// # 테스트 실행
// npm run test

describe('userUtils', () => {
    describe('create', () => {
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
                new BaseError('BIZ_DUPLICATE_PROVIDER', { providerId: userData.providerId })
            );
        });

        it('유효하지 않은 providerId로 유저 생성 시 예외를 발생시킨다', async () => {
            // given: providerIdHash가 빈 문자열인 사용자 데이터
            const userData = createTestUser({ providerId: '' });

            // when & then: 사용자 생성 시 예외 발생
            await expect(userUtils.create(userData)).rejects.toThrow(
                new BaseError('BIZ_INVALID_JWT')
            );
        });
    });

    describe('findByProviderId', () => {
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

    describe('softDelete', () => {
        it('정상적으로 유저를 소프트 삭제한다', async () => {
            // given: 테스트 사용자 생성
            const userData = createTestUser({ providerId: 'testProviderId' });
            const user = await userUtils.create(userData);

            // when: 유저를 소프트 삭제
            const deletedUser = await userUtils.softDelete(user.id);

            // then: 삭제된 사용자의 속성 확인
            expect(deletedUser).toMatchObject({
                id: user.id,
                isDeleted: true,
            });
            expect(deletedUser.deletedAt).toBeInstanceOf(Date); // 삭제 일자 확인
        });

        it('이미 삭제된 유저를 소프트 삭제하려 하면 예외를 발생시킨다', async () => {
            // given: 이미 삭제된 사용자 생성
            const userData = createTestUser({ providerId: 'testProviderId' });
            const user = await userUtils.create(userData);
            await userUtils.softDelete(user.id);

            // when & then: 동일 유저를 다시 삭제 시도 → 예외 발생
            await expect(userUtils.softDelete(user.id)).rejects.toThrow(
                new BaseError('BIZ_USER_NOT_FOUND', { id: user.id })
            );
        });

        it('존재하지 않는 유저를 소프트 삭제하려 하면 예외를 발생시킨다', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentUserId = 'nonexistentId';

            // when & then: 삭제 시도 → 예외 발생
            await expect(userUtils.softDelete(nonExistentUserId)).rejects.toThrow(
                new BaseError('BIZ_USER_NOT_FOUND', { id: nonExistentUserId })
            );
        });
    });

    describe('restore', () => {
        it('정상적으로 유저를 복구한다', async () => {
            // given: 테스트 사용자 생성 및 삭제
            const userData = createTestUser({ providerId: 'testProviderId' });
            const user = await userUtils.create(userData);
            await userUtils.softDelete(user.id);

            // when: 유저를 복구
            const restoredUser = await userUtils.restore(user.id);

            // then: 복구된 사용자의 속성 확인
            expect(restoredUser).toMatchObject({
                id: user.id,
                isDeleted: false,
                deletedAt: null, // 복구 후 삭제 일자가 null이어야 함
            });
        });

        it('삭제되지 않은 유저를 복구하려 하면 예외를 발생시킨다', async () => {
            // given: 테스트 사용자 생성
            const userData = createTestUser({ providerId: 'testProviderId' });
            const user = await userUtils.create(userData);

            // when & then: 삭제되지 않은 유저를 복구 시도 → 예외 발생
            await expect(userUtils.restore(user.id)).rejects.toThrow(
                new BaseError('BIZ_USER_NOT_FOUND', { id: user.id })
            );
        });

        it('존재하지 않는 유저를 복구하려 하면 예외를 발생시킨다', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentUserId = 'nonexistentId';

            // when & then: 복구 시도 → 예외 발생
            await expect(userUtils.restore(nonExistentUserId)).rejects.toThrow(
                new BaseError('BIZ_USER_NOT_FOUND', { id: nonExistentUserId })
            );
        });
    });
});
