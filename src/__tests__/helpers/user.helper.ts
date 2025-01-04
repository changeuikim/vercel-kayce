import { CreateUserInput } from '@/lib/db/user/types';
import { parseAndHashProviderId } from '@/lib/db/user/utils';
import { AuthProvider } from '@prisma/client';

// 테스트 사용자 데이터 생성 함수
export const createTestUser = (override: Partial<CreateUserInput> = {}): CreateUserInput => ({
    provider: AuthProvider.GITHUB, // 기본값으로 GitHub 사용
    providerId: 'testProviderIdHash', // 공급자 ID
    ...override,
});
