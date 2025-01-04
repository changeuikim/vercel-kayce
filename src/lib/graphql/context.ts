import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type Role = "admin" | "user";

export interface User {
  id: string;
  role: Role; // 역할을 열거형으로 제한
}

export interface Context {
  prisma: PrismaClient;
  user?: User;
}

// Context 생성 함수
export const createContext = (req: Request): Context => {
  const authHeader = req.headers.get("authorization");

  let user: User | undefined;

  if (authHeader) {
    try {
      // JWT 토큰을 파싱하여 사용자 정보 추출 (예제)
      const token = authHeader.replace("Bearer ", "");
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // 실제 JWT 파싱 필요

      // Prisma를 사용해 사용자 또는 관리자의 역할을 확인
      if (decodedToken.isAdmin) {
        user = {
          id: decodedToken.sub, // 사용자 ID
          role: "admin", // 관리자 역할
        };
      } else {
        user = {
          id: decodedToken.sub,
          role: "user", // 일반 사용자 역할
        };
      }
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return {
    prisma,
    user,
  };
};
