import { userUtils } from '@/lib/db/user';
import { AuthProvider, AccountStatus, UserRole } from '@prisma/client';
import { PrismaCustomError } from '@/lib/db/errors';
import { createTestUser, createTestUsers } from '../helpers/user.helper';

describe('userUtils', () => {
    // 비밀번호 해시화 관련 테스트
    describe('hashPassword', () => {
        it('비밀번호 해시화 테스트', async () => {
            // given: 원본 비밀번호
            const password = 'testPassword123';

            // when: 비밀번호 해시화
            const hashedPassword = await userUtils.hashPassword(password);

            // then: 해시된 비밀번호는 원본과 다르며, 올바른 형식을 가짐
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword).toMatch(/^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
        });
    });

    // 사용자 생성 관련 테스트
    describe('create', () => {
        it('로컬 회원가입 - 정상 케이스', async () => {
            // given: 테스트 사용자 데이터를 준비
            const userData = createTestUser();

            // when: 사용자를 생성
            const user = await userUtils.create(userData);

            // then: 생성된 사용자가 기대한 속성을 가졌는지 검증
            expect(user).toMatchObject({
                email: userData.email,
                name: userData.name,
                provider: AuthProvider.LOCAL,
                status: AccountStatus.PENDING,
                role: UserRole.USER,
            });
            expect(user).not.toHaveProperty('password'); // 비밀번호는 노출되지 않아야 함
            expect(user).toHaveProperty('id'); // ID가 있어야 함
        });

        it('중복 이메일 - 에러 케이스', async () => {
            // given: 동일한 이메일을 가진 사용자 두 명을 준비
            const userData = createTestUser();
            await userUtils.create(userData);

            // when & then: 동일한 이메일로 사용자 생성 시도 → 에러 발생
            await expect(userUtils.create(userData)).rejects.toThrowError(
                new PrismaCustomError('DUPLICATE_EMAIL', '이미 사용 중인 이메일입니다.')
            );
        });
    });

    // 이메일로 사용자 조회 관련 테스트
    describe('findByEmail', () => {
        it('존재하는 이메일 조회', async () => {
            // given: 사용자를 생성
            const userData = createTestUser();
            await userUtils.create(userData);

            // when: 해당 이메일로 사용자 조회
            const user = await userUtils.findByEmail(userData.email);

            // then: 조회된 사용자가 기대한 속성을 가졌는지 검증
            expect(user).toBeTruthy();
            expect(user?.email).toBe(userData.email);
        });

        it('삭제된 사용자 조회 - includeDeleted 옵션', async () => {
            // given: 사용자를 생성 후 삭제
            const userData = createTestUser();
            const createdUser = await userUtils.create(userData);
            await userUtils.softDelete(createdUser.id);

            // when: 기본 조회 → 삭제된 사용자는 조회되지 않음
            const notFound = await userUtils.findByEmail(userData.email);

            // then: 삭제된 사용자는 조회 결과가 null
            expect(notFound).toBeNull();

            // when: 삭제된 사용자 포함 옵션으로 조회
            const found = await userUtils.findByEmail(userData.email, { includeDeleted: true });

            // then: 삭제된 사용자 정보가 조회됨
            expect(found).toBeTruthy();
            expect(found?.isDeleted).toBe(true);
        });
    });

    // 아이디로 사용자 조회 관련 테스트
    describe('findById', () => {
        it('존재하는 사용자 조회', async () => {
            // given: 사용자 생성
            const userData = createTestUser();
            const createdUser = await userUtils.create(userData);

            // when: ID로 사용자 조회
            const user = await userUtils.findById(createdUser.id);

            // then: 조회된 사용자 정보가 기대값과 일치
            expect(user).toBeTruthy();
            expect(user?.id).toBe(createdUser.id);
        });

        it('존재하지 않는 사용자 조회', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentId = 'non-existent-id';

            // when & then: 조회 시 null 반환
            const user = await userUtils.findById(nonExistentId);
            expect(user).toBeNull();
        });
    });

    // 사용자 목록 조회 관련 테스트
    describe('findMany', () => {
        it('페이지네이션 테스트', async () => {
            // given: 다수의 사용자를 생성
            const users = await createTestUsers(15);
            for (const userData of users) {
                await userUtils.create(userData);
            }

            // when: 첫 번째 페이지 조회
            const page1 = await userUtils.findMany({ page: 1, limit: 10 });

            // then: 첫 번째 페이지에 10명의 사용자
            expect(page1.users).toHaveLength(10);
            expect(page1.total).toBe(15);
            expect(page1.totalPages).toBe(2);

            // when: 두 번째 페이지 조회
            const page2 = await userUtils.findMany({ page: 2, limit: 10 });

            // then: 두 번째 페이지에 5명의 사용자
            expect(page2.users).toHaveLength(5);
        });

        it('정렬 테스트', async () => {
            // given: 여러 사용자를 생성
            const users = await createTestUsers(3);
            for (const userData of users) {
                await userUtils.create(userData);
            }

            // when: 생성일 기준으로 내림차순 정렬
            const result = await userUtils.findMany({
                orderBy: { createdAt: 'desc' },
            });

            // then: 정렬 결과가 올바른지 검증
            expect(result.users).toHaveLength(3);
            expect(new Date(result.users[0].createdAt) > new Date(result.users[1].createdAt)).toBe(
                true
            );
        });
    });

    // 사용자 정보 업데이트 관련 테스트
    describe('update', () => {
        it('사용자 정보 업데이트 - 정상 케이스', async () => {
            // given: 사용자 생성
            const userData = createTestUser();
            const createdUser = await userUtils.create(userData);

            // when: 사용자 이름 업데이트
            const updatedUser = await userUtils.update(createdUser.id, { name: '업데이트된 이름' });

            // then: 업데이트된 사용자 정보 검증
            expect(updatedUser.name).toBe('업데이트된 이름');
        });

        it('존재하지 않는 사용자 업데이트 - 에러 케이스', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentId = 'non-existent-id';

            // when & then: 업데이트 시 NOT_FOUND 에러 발생
            await expect(
                userUtils.update(nonExistentId, { name: '업데이트된 이름' })
            ).rejects.toThrowError(
                new PrismaCustomError('NOT_FOUND', '데이터를 찾을 수 없습니다.')
            );
        });
    });

    // 사용자 상태 업데이트 관련 테스트
    describe('updateStatus', () => {
        it('사용자 상태 업데이트', async () => {
            // given: 사용자를 생성
            const userData = createTestUser();
            const user = await userUtils.create(userData);

            // when: 사용자 상태를 ACTIVE로 업데이트
            const updatedUser = await userUtils.updateStatus(user.id, AccountStatus.ACTIVE);

            // then: 상태가 업데이트되었는지 검증
            expect(updatedUser.status).toBe(AccountStatus.ACTIVE);
        });

        it('존재하지 않는 사용자 - 에러 케이스', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentId = 'non-existent-id';

            // when & then: 상태 업데이트 시도 → NOT_FOUND 에러 발생
            await expect(
                userUtils.updateStatus(nonExistentId, AccountStatus.ACTIVE)
            ).rejects.toThrowError(
                new PrismaCustomError('NOT_FOUND', '데이터를 찾을 수 없습니다.')
            );
        });
    });

    // 사용자 소프트 삭제 관련 테스트
    describe('softDelete', () => {
        it('사용자 소프트 삭제 - 정상 케이스', async () => {
            // given: 사용자 생성
            const userData = createTestUser();
            const createdUser = await userUtils.create(userData);

            // when: 사용자 소프트 삭제
            const deletedUser = await userUtils.softDelete(createdUser.id);

            // then: 삭제된 사용자 정보 검증
            expect(deletedUser.isDeleted).toBe(true);
            expect(deletedUser.deletedAt).toBeTruthy();
        });

        it('존재하지 않는 사용자 소프트 삭제 - 에러 케이스', async () => {
            // given: 존재하지 않는 사용자 ID
            const nonExistentId = 'non-existent-id';

            // when & then: 소프트 삭제 시 NOT_FOUND 에러 발생
            await expect(userUtils.softDelete(nonExistentId)).rejects.toThrowError(
                new PrismaCustomError('NOT_FOUND', '데이터를 찾을 수 없습니다.')
            );
        });
    });
});
