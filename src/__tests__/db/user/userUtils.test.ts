import { userUtils, parseAndHashProviderId } from "@/lib/db/user/userUtils";
import {
  createTestUser,
  prepareBatchTestUsers,
} from "@/__tests__/helpers/userUtils.helper";
import { BaseError } from "@/lib/error/base-error-handler";

// # 테스트 데이터베이스 준비
// npx prisma migrate reset --force --preview-feature

// # 테스트 실행
// npm run test

describe("userUtils", () => {
  describe("create", () => {
    it("정상적으로 유저를 생성한다", async () => {
      // given: 테스트 사용자 데이터 준비
      const userData = createTestUser({ providerId: "testProviderId" });

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
      expect(user).toHaveProperty("id");
    });

    it("중복 providerId로 유저 생성 시 예외를 발생시킨다", async () => {
      // given: 테스트 사용자 데이터 준비
      const userData = createTestUser({ providerId: "testProviderId" });
      await userUtils.create(userData);

      // when & then: 동일한 providerId로 사용자 생성 시도 → 예외 발생
      await expect(userUtils.create(userData)).rejects.toThrow(
        new BaseError("BIZ_DUPLICATE_PROVIDER", {
          providerId: userData.providerId,
        }),
      );
    });

    it("유효하지 않은 providerId로 유저 생성 시 예외를 발생시킨다", async () => {
      // given: providerIdHash가 빈 문자열인 사용자 데이터
      const userData = createTestUser({ providerId: "" });

      // when & then: 사용자 생성 시 예외 발생
      await expect(userUtils.create(userData)).rejects.toThrow(
        new BaseError("BIZ_INVALID_JWT"),
      );
    });
  });

  describe("findByProviderId", () => {
    it("정상적으로 유저를 조회한다", async () => {
      // given: providerId로 사용자 생성
      const userData = createTestUser({ providerId: "testProviderId" });
      await userUtils.create(userData);

      // when: 유저를 조회
      const user = await userUtils.findByProviderId(userData.providerId);

      // then: 조회된 유저가 기대한 속성을 가지는지 확인
      expect(user).toMatchObject({
        provider: userData.provider,
        isDeleted: false,
        deletedAt: null,
      });
      expect(user).toHaveProperty("id"); // ID 확인
    });

    it("존재하지 않는 providerIdHash로 조회 시 null을 반환한다", async () => {
      // given: 존재하지 않는 providerIdHash
      const nonExistentProviderId = "nonexistent";

      // when: 유저를 조회
      const user = await userUtils.findByProviderId(nonExistentProviderId);

      // then: null을 반환해야 함
      expect(user).toBeNull();
    });

    it("유효하지 않은 providerIdHash로 조회 시 예외를 발생시킨다", async () => {
      // given: 유효하지 않은 providerIdHash
      const invalidProviderId = "";

      // when & then: 조회 시 예외 발생
      await expect(
        userUtils.findByProviderId(invalidProviderId),
      ).rejects.toThrow("JWT token cannot be empty");
    });
  });

  describe("findMany", () => {
    beforeEach(async () => {
      // Given: 테스트 데이터 생성
      const testUsers = prepareBatchTestUsers(5);

      // 서로 다른 상태와 날짜를 가진 사용자들 생성
      await Promise.all([
        userUtils.create(testUsers[0]), // 활성 사용자
        userUtils.create(testUsers[1]), // 활성 사용자
        userUtils
          .create(testUsers[2])
          .then((user) => userUtils.softDelete(user.id)), // 삭제된 사용자
        userUtils.create(testUsers[3]), // 활성 사용자
        userUtils
          .create(testUsers[4])
          .then((user) => userUtils.softDelete(user.id)), // 삭제된 사용자
      ]);
    });

    describe("기본 조회", () => {
      it("옵션 없이 조회하면 모든 사용자를 반환한다", async () => {
        // When: 사용자를 조회
        const result = await userUtils.findMany({});

        // Then: 모든 사용자와 메타데이터 확인
        expect(result.totalCount).toBe(5);
        expect(result.users.length).toBe(5);
        expect(result.hasNextPage).toBe(false);
      });
    });

    describe("필터링", () => {
      it("생성일자 범위로 필터링한다", async () => {
        // When: 특정 생성일자 범위로 필터링하여 사용자 조회
        const result = await userUtils.findMany({
          filter: {
            createdAt: {
              gte: "2025-01-01T00:00:00Z",
              lte: "2025-01-02T00:00:00Z",
            },
          },
        });

        // Then: 조회된 사용자가 범위 내에 있는지 확인
        expect(
          result.users.every(
            (user) =>
              new Date(user.createdAt) >= new Date("2025-01-01") &&
              new Date(user.createdAt) <= new Date("2025-01-02"),
          ),
        ).toBe(true);
      });

      it("삭제일자 범위로 필터링한다", async () => {
        // When: 특정 삭제일자 범위로 필터링하여 사용자 조회
        const result = await userUtils.findMany({
          filter: {
            deletedAt: {
              gte: "2025-01-01T00:00:00Z",
            },
          },
        });

        // Then: 조회된 사용자가 범위 내에 있는지 확인
        expect(
          result.users.every(
            (user) =>
              user.deletedAt &&
              new Date(user.deletedAt) >= new Date("2025-01-01"),
          ),
        ).toBe(true);
      });

      it("AND 조건으로 필터링한다", async () => {
        // When: AND 조건을 사용하여 사용자 조회
        const result = await userUtils.findMany({
          filter: {
            AND: [
              {
                isDeleted: true,
                deletedAt: {
                  gte: "2025-01-01T00:00:00Z",
                },
              },
            ],
          },
        });

        // Then: 모든 조회된 사용자가 조건을 만족하는지 확인
        expect(
          result.users.every(
            (user) =>
              user.isDeleted &&
              user.deletedAt &&
              new Date(user.deletedAt) >= new Date("2025-01-01"),
          ),
        ).toBe(true);
      });

      it("OR 조건으로 필터링한다", async () => {
        // When: OR 조건을 사용하여 사용자 조회
        const result = await userUtils.findMany({
          filter: {
            OR: [
              {
                isDeleted: true,
              },
              {
                createdAt: {
                  gte: "2025-01-02T00:00:00Z",
                },
              },
            ],
          },
        });

        // Then: 조회된 사용자가 조건 중 하나를 만족하는지 확인
        expect(
          result.users.every(
            (user) =>
              user.isDeleted ||
              new Date(user.createdAt) >= new Date("2025-01-02"),
          ),
        ).toBe(true);
      });
    });

    describe("정렬", () => {
      it("생성일자 기준 오름차순 정렬한다", async () => {
        // When: 생성일자 기준으로 오름차순 정렬하여 사용자 조회
        const result = await userUtils.findMany({
          sort: [{ field: "createdAt", direction: "asc" }],
        });

        // Then: 데이터가 오름차순으로 정렬되었는지 확인
        const dates = result.users.map((user) =>
          new Date(user.createdAt).getTime(),
        );
        expect(dates).toEqual([...dates].sort((a, b) => a - b));
      });

      it("삭제일자 기준 내림차순 정렬한다", async () => {
        // When: 삭제일자 기준으로 내림차순 정렬하여 사용자 조회
        const result = await userUtils.findMany({
          filter: { isDeleted: true },
          sort: [{ field: "deletedAt", direction: "desc" }],
        });

        // Then: 데이터가 내림차순으로 정렬되었는지 확인
        const dates = result.users.map((user) =>
          user.deletedAt ? new Date(user.deletedAt).getTime() : 0,
        );
        expect(dates).toEqual([...dates].sort((a, b) => b - a));
      });
    });

    describe("페이지네이션", () => {
      it("지정된 개수만큼만 조회한다", async () => {
        // When: 특정 개수만큼 사용자 조회
        const result = await userUtils.findMany({
          pagination: { take: 2 },
        });

        // Then: 반환된 데이터 개수와 hasNextPage 확인
        expect(result.users.length).toBe(2);
        expect(result.hasNextPage).toBe(true);
      });

      it("커서 기반 페이지네이션이 작동한다", async () => {
        // Given: 첫 번째 페이지 조회
        const firstPage = await userUtils.findMany({
          pagination: { take: 2 },
        });

        // When: 두 번째 페이지 조회
        const secondPage = await userUtils.findMany({
          pagination: {
            take: 2,
            cursor: firstPage.users[1].id,
          },
        });

        // Then: 첫 번째 페이지와 두 번째 페이지의 데이터가 다름을 확인
        expect(firstPage.users).not.toEqual(secondPage.users);
        expect(secondPage.users[0].id).not.toBe(firstPage.users[1].id);
      });

      it("데이터가 더 없을 경우 hasNextPage가 false이다", async () => {
        // When: take보다 더 많은 데이터를 요청
        const result = await userUtils.findMany({
          pagination: { take: 10 },
        });

        // Then: hasNextPage가 false임을 확인
        expect(result.hasNextPage).toBe(false);
      });
    });

    describe("복합 조건", () => {
      it("필터, 정렬, 페이지네이션을 모두 적용한다", async () => {
        // When: 필터, 정렬, 페이지네이션을 조합하여 사용자 조회
        const result = await userUtils.findMany({
          filter: { isDeleted: false },
          sort: [{ field: "createdAt", direction: "desc" }],
          pagination: { take: 2 },
        });

        // Then: 필터 조건, 정렬 순서, 페이지네이션 크기 확인
        expect(result.users.length).toBe(2);
        expect(result.users.every((user) => !user.isDeleted)).toBe(true);

        const dates = result.users.map((user) =>
          new Date(user.createdAt).getTime(),
        );
        expect(dates).toEqual([...dates].sort((a, b) => b - a));
      });
    });
  });

  describe("softDelete", () => {
    it("정상적으로 유저를 소프트 삭제한다", async () => {
      // given: 테스트 사용자 생성
      const userData = createTestUser({ providerId: "testProviderId" });
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

    it("이미 삭제된 유저를 소프트 삭제하려 하면 예외를 발생시킨다", async () => {
      // given: 이미 삭제된 사용자 생성
      const userData = createTestUser({ providerId: "testProviderId" });
      const user = await userUtils.create(userData);
      await userUtils.softDelete(user.id);

      // when & then: 동일 유저를 다시 삭제 시도 → 예외 발생
      await expect(userUtils.softDelete(user.id)).rejects.toThrow(
        new BaseError("BIZ_USER_NOT_FOUND", { id: user.id }),
      );
    });

    it("존재하지 않는 유저를 소프트 삭제하려 하면 예외를 발생시킨다", async () => {
      // given: 존재하지 않는 사용자 ID
      const nonExistentUserId = "nonexistentId";

      // when & then: 삭제 시도 → 예외 발생
      await expect(userUtils.softDelete(nonExistentUserId)).rejects.toThrow(
        new BaseError("BIZ_USER_NOT_FOUND", { id: nonExistentUserId }),
      );
    });
  });

  describe("restore", () => {
    it("정상적으로 유저를 복구한다", async () => {
      // given: 테스트 사용자 생성 및 삭제
      const userData = createTestUser({ providerId: "testProviderId" });
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

    it("삭제되지 않은 유저를 복구하려 하면 예외를 발생시킨다", async () => {
      // given: 테스트 사용자 생성
      const userData = createTestUser({ providerId: "testProviderId" });
      const user = await userUtils.create(userData);

      // when & then: 삭제되지 않은 유저를 복구 시도 → 예외 발생
      await expect(userUtils.restore(user.id)).rejects.toThrow(
        new BaseError("BIZ_USER_NOT_FOUND", { id: user.id }),
      );
    });

    it("존재하지 않는 유저를 복구하려 하면 예외를 발생시킨다", async () => {
      // given: 존재하지 않는 사용자 ID
      const nonExistentUserId = "nonexistentId";

      // when & then: 복구 시도 → 예외 발생
      await expect(userUtils.restore(nonExistentUserId)).rejects.toThrow(
        new BaseError("BIZ_USER_NOT_FOUND", { id: nonExistentUserId }),
      );
    });
  });
});
