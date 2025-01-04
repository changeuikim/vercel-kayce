import { CreateUserInput } from "@/lib/db/user/types";
import { AuthProvider } from "@prisma/client";

// 단일 테스트 유저 데이터 준비
export const createTestUser = (
  override: Partial<CreateUserInput> = {},
): CreateUserInput => ({
  provider: AuthProvider.GITHUB,
  providerId: `test-user-${Date.now()}`,
  ...override,
});

// 여러 테스트 유저 데이터 준비
export const prepareBatchTestUsers = (
  count: number,
  overrides: Partial<CreateUserInput> = {},
): CreateUserInput[] => {
  const providers = Object.values(AuthProvider);

  return Array.from({ length: count }, (_, i) => ({
    provider: providers[i % providers.length], // 프로바이더를 순환하며 할당
    providerId: `test-${providers[i % providers.length].toLowerCase()}-user-${i + 1}`,
    ...overrides,
  }));
};
