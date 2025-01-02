// PrismaClient를 임포트 (Prisma ORM의 데이터베이스 클라이언트)
import { PrismaClient } from '@prisma/client';

// 공유 Prisma 인스턴스를 임포트 (애플리케이션 내에서 Prisma 클라이언트를 재사용)
import { prisma } from '@/lib/prisma';

// DataLoader 생성 함수와 타입을 임포트
import { createLoaders, Loaders } from '@/app/api/graphql/loaders';

// YogaInitialContext는 graphql-yoga의 초기 컨텍스트 타입
import { YogaInitialContext } from 'graphql-yoga';

/**
 * GraphQL 컨텍스트 인터페이스
 * - Prisma 클라이언트, 사용자 ID, DataLoader 등을 포함
 */
export interface Context extends YogaInitialContext {
    prisma: PrismaClient; // Prisma ORM 인스턴스
    userId?: number; // 인증된 사용자의 ID (없을 수도 있음)
    loaders: Loaders; // DataLoader 객체
}

/**
 * GraphQL 요청에 따라 컨텍스트를 생성하는 함수
 * - 요청 헤더에서 사용자 ID를 가져오고 Prisma 및 DataLoader를 포함한 컨텍스트를 반환
 * @param request YogaInitialContext에서 제공되는 요청 객체
 * @param params YogaInitialContext에서 제공되는 요청 객체
 * @returns GraphQL 실행 시 사용할 컨텍스트
 */
export const createContext = async ({ request, params }: YogaInitialContext): Promise<Context> => {
    // 요청 헤더에서 사용자 ID를 추출
    const userId = request.headers.get('x-user-id');

    return {
        prisma, // Prisma 클라이언트 인스턴스
        userId: userId ? parseInt(userId) : undefined, // 사용자 ID를 숫자로 변환하거나 undefined로 설정
        loaders: createLoaders(prisma), // DataLoader 인스턴스 생성
        request, // YogaInitialContext에서 받은 request를 반환
        params, // YogaInitialContext에서 받은 params를 반환
    };
};

/*
1. Context 인터페이스
    GraphQL 실행 시 컨텍스트는 리졸버 함수에서 공유되는 객체입니다. 여기서는 다음 항목들이 포함됩니다:

    prisma: Prisma 클라이언트를 통해 데이터베이스 작업을 수행.
    userId: 요청한 사용자의 ID를 저장. 인증된 사용자가 아닐 경우 undefined.
    loaders: DataLoader 객체를 포함하여 데이터 로드 최적화.

2. createContext 함수
    GraphQL 요청마다 실행되는 함수로, 요청 헤더나 기타 데이터를 기반으로 컨텍스트를 생성합니다.

    요청의 x-user-id 헤더에서 사용자 ID를 읽어옵니다.
    Prisma 클라이언트와 DataLoader를 컨텍스트에 포함합니다.
    반환된 컨텍스트는 모든 GraphQL 리졸버에서 사용됩니다.
*/
