import { CreateUserInput } from "@/lib/db/user/types";
import { parseAndHashProviderId } from "@/lib/db/user/utils";
import { AuthProvider } from "@prisma/client";

// 테스트 사용자 데이터 생성 함수
export const createTestUser = (
  override: Partial<CreateUserInput> = {},
): CreateUserInput => ({
  provider: AuthProvider.GITHUB, // 기본값으로 GitHub 사용
  providerId: "testProviderIdHash", // 공급자 ID
  ...override,
});

// 테스트 사용자 데이터 생성기
export const createTestUsers = async (
  count: number,
  baseProviderId = "testId",
): Promise<{ users: CreateUserInput[]; hashedIds: string[] }> => {
  const users: CreateUserInput[] = [];
  const hashedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const providerId = `${baseProviderId}${i}`;
    users.push(createTestUser({ providerId }));
    hashedIds.push(parseAndHashProviderId(providerId));
  }

  return { users, hashedIds };
};
