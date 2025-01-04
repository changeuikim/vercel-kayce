import { CreateUserInput } from '@/lib/db/user/types';
import { AuthProvider } from '@prisma/client';

// 테스트 사용자 데이터 생성 함수
export const createTestUser = (override: Partial<CreateUserInput> = {}): CreateUserInput => ({
    provider: AuthProvider.GITHUB, // 기본값으로 GitHub 사용
    providerId: 'testProviderIdHash', // 공급자 ID
    ...override,
});

// 테스트 사용자 데이터 생성기
export const createTestUsers = async (count: number, baseProviderId = 'testId') => {
    const users: CreateUserInput[] = [];
    for (let i = 0; i < count; i++) {
        users.push(
            createTestUser({
                providerId: `${baseProviderId}${i}`,
            })
        );
    }
    return users;
};
