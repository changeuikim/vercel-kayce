// DataLoader를 위한 라이브러리
import DataLoader from 'dataloader';

// Prisma 클라이언트
import { PrismaClient } from '@prisma/client';

// Lodash 유틸리티 함수 (데이터를 그룹화하는 데 사용)
import { groupBy } from 'lodash';

/**
 * Prisma와 DataLoader를 결합하여 데이터베이스 요청을 최적화하는 로더 생성 함수
 * @param prisma PrismaClient 인스턴스
 * @returns 로더 객체
 */
export const createLoaders = (prisma: PrismaClient) => ({
    /**
     * CategoryLoader
     * 각 Post ID에 연결된 Categories를 한 번의 쿼리로 로드
     */
    categoryLoader: new DataLoader(async (postIds: readonly number[]) => {
        // 모든 Post ID에 연결된 Categories를 가져오기 위한 Prisma 쿼리
        const categories = await prisma.category.findMany({
            where: {
                posts: {
                    some: {
                        id: { in: [...postIds] }, // postIds 배열에 포함된 Post와 관련된 Categories만 가져옴
                    },
                },
            },
            include: {
                posts: {
                    select: { id: true }, // 각 Category에 연결된 Post ID만 가져옴
                },
            },
        });

        // Categories 데이터를 Post ID 기준으로 그룹화
        const categoryByPostId = groupBy(
            categories.flatMap((category) =>
                category.posts.map((post) => ({
                    ...category,
                    posts: undefined, // 중복된 데이터 제거
                    postId: post.id, // Post ID 추가
                }))
            ),
            'postId' // 그룹화 키
        );

        // 요청된 각 Post ID에 해당하는 Categories 배열을 반환
        return postIds.map((id) => categoryByPostId[id] || []);
    }),

    /**
     * TagLoader
     * 각 Post ID에 연결된 Tags를 한 번의 쿼리로 로드
     */
    tagLoader: new DataLoader(async (postIds: readonly number[]) => {
        // 모든 Post ID에 연결된 Tags를 가져오기 위한 Prisma 쿼리
        const tags = await prisma.tag.findMany({
            where: {
                posts: {
                    some: {
                        id: { in: [...postIds] }, // postIds 배열에 포함된 Post와 관련된 Tags만 가져옴
                    },
                },
            },
            include: {
                posts: {
                    select: { id: true }, // 각 Tag에 연결된 Post ID만 가져옴
                },
            },
        });

        // Tags 데이터를 Post ID 기준으로 그룹화
        const tagsByPostId = groupBy(
            tags.flatMap((tag) =>
                tag.posts.map((post) => ({
                    ...tag,
                    posts: undefined, // 중복된 데이터 제거
                    postId: post.id, // Post ID 추가
                }))
            ),
            'postId' // 그룹화 키
        );

        // 요청된 각 Post ID에 해당하는 Tags 배열을 반환
        return postIds.map((id) => tagsByPostId[id] || []);
    }),

    /**
     * LikesLoader
     * 각 Post ID에 연결된 Likes를 한 번의 쿼리로 로드
     */
    likesLoader: new DataLoader(async (postIds: readonly number[]) => {
        // 모든 Post ID에 연결된 Likes를 가져오기 위한 Prisma 쿼리
        const likes = await prisma.like.findMany({
            where: {
                postId: { in: [...postIds] }, // postIds 배열에 포함된 Post와 관련된 Likes만 가져옴
            },
        });

        // Likes 데이터를 Post ID 기준으로 그룹화
        const likesByPostId = groupBy(likes, 'postId');

        // 요청된 각 Post ID에 해당하는 Likes 배열을 반환
        return postIds.map((id) => likesByPostId[id] || []);
    }),
});

/**
 * createLoaders 함수에서 생성된 로더 타입 정의
 */
export type Loaders = ReturnType<typeof createLoaders>;

/*
1. categoryLoader
    역할: 각 Post ID에 연결된 모든 Categories를 한 번의 데이터베이스 쿼리로 로드합니다.
    동작:
        Prisma를 사용해 각 Post에 연결된 Category를 조회합니다.
        조회된 Category 데이터를 Post ID별로 그룹화합니다.
        요청된 Post ID 순서에 맞게 데이터 배열을 반환합니다.
2. tagLoader
    역할: 각 Post ID에 연결된 모든 Tags를 한 번의 데이터베이스 쿼리로 로드합니다.
    동작:
        categoryLoader와 동일한 방식으로 동작하며, Tags 데이터를 Post ID별로 그룹화하여 반환합니다.
3. likesLoader
    역할: 각 Post ID에 연결된 모든 Likes를 한 번의 데이터베이스 쿼리로 로드합니다.
    동작:
        Prisma를 사용해 postId 필드를 기준으로 Likes 데이터를 조회합니다.
        조회된 데이터를 groupBy를 사용해 Post ID별로 그룹화합니다.
        요청된 Post ID 순서에 맞게 Likes 배열을 반환합니다.
*/
