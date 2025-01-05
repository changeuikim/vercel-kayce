import { AuthProvider, Prisma, User } from "@prisma/client";
import { userSelectFields } from "./constants";

// 1. create
// 유저 생성 시 필요한 데이터 타입
export type CreateUserInput = {
  provider: AuthProvider; // 인증 공급자 (GITHUB, GOOGLE 등)
  providerId: string; // 해시 전 공급자 ID
};

// SafeUser 타입 동기화
export type UserSelectFields = typeof userSelectFields;

// 비밀번호를 제외한 안전한 유저 정보 타입
export type SafeUser = {
  [K in keyof UserSelectFields]: K extends keyof User ? User[K] : never;
};

// 3. findMany
// 날짜 범위 조건을 위한 타입
export type DateRangeFilter = {
  gte?: Date | string; // After
  lte?: Date | string; // Before
};

// 유저 데이터를 필터링하기 위한 조건을 정의
export type UserFilter = {
  isDeleted?: boolean;
  createdAt?: DateRangeFilter;
  deletedAt?: DateRangeFilter;
  AND?: UserFilter[];
  OR?: UserFilter[];
};

// 유저 데이터의 정렬 조건을 지정
export type UserSort = {
  field: keyof Pick<User, "createdAt" | "deletedAt">; // 정렬 가능한 필드
  direction: "asc" | "desc"; // 정렬 방향
};

// 클라이언트가 요청할 유저 데이터의 범위를 지정
export type UserPagination = {
  take?: number; // 가져올 데이터 수
  skip?: number; // 건너뛸 데이터 수
  cursor?: string; // 커서 기반 페이지네이션
};

// 필터링, 정렬, 페이지네이션을 하나로 묶은 타입
export type UserFindOptions = {
  filter?: UserFilter; // 필터 조건
  sort?: UserSort[]; // 정렬 조건
  pagination?: UserPagination; // 페이지네이션 옵션
};

// REST API에서 반환할 데이터를 정의
export type UserFindResult = {
  users: SafeUser[]; // 조회된 사용자 데이터
  totalCount: number; // 전체 사용자 수
  hasNextPage: boolean; // 다음 페이지 여부
};

// Prisma의 findMany 함수 호출 시 사용할 타입
export type PrismaUserFindManyArgs = {
  where?: Prisma.UserWhereInput; // 필터 조건
  orderBy?: Prisma.UserOrderByWithRelationInput[]; // 정렬 조건
  take?: number; // 가져올 데이터 수
  skip?: number; // 건너뛸 데이터 수
  cursor?: Prisma.UserWhereUniqueInput; // 커서 기반 페이지네이션
};
