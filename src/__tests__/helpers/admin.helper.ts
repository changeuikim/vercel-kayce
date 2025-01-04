// import { CreateUserInput } from '@/lib/db/user/types';
// import { AuthProvider } from '@prisma/client';

// export const createTestUser = (override: Partial<CreateUserInput> = {}): CreateUserInput => ({
//     email: 'test@example.com',
//     password: 'password123',
//     name: '테스트 유저',
//     provider: AuthProvider.LOCAL,
//     status: AccountStatus.PENDING,
//     role: UserRole.USER,
//     ...override,
// });

// export const createTestUsers = async (count: number, baseEmail = 'test') => {
//     const users: CreateUserInput[] = [];
//     for (let i = 0; i < count; i++) {
//         users.push(
//             createTestUser({
//                 email: `${baseEmail}${i}@example.com`,
//             })
//         );
//     }
//     return users;
// };
