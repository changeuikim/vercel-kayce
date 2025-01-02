import { Resolvers } from '@/app/graphql/generated/types'; // Codegen으로 생성된 타입
import { prisma } from '@/lib/prisma'; // 싱글턴 Prisma Client 사용

export const queryResolvers: Resolvers = {
    Query: {
        filterPosts: async (_, { filter, sort, limit, cursor }, { userId }) => {
            const where: any = {}; // 조건을 동적으로 추가하기 위해 초기화

            // 필터 조건 추가
            if (filter) {
                if (filter.tags && filter.tags.length > 0) {
                    where.tags = { some: { name: { in: filter.tags } } };
                }
                if (filter.categories && filter.categories.length > 0) {
                    where.categories = { some: { name: { in: filter.categories } } };
                }
                if (filter.likedByUser && userId) {
                    where.likes = { some: { userId } };
                }
                if (filter.dateRange) {
                    where.updatedAt = {
                        ...(filter.dateRange.start && { gte: filter.dateRange.start }),
                        ...(filter.dateRange.end && { lte: filter.dateRange.end }),
                    };
                }
                if (filter.keyword) {
                    where.OR = [
                        { title: { contains: filter.keyword, mode: 'insensitive' } },
                        { content: { contains: filter.keyword, mode: 'insensitive' } },
                    ];
                }
            }

            const orderBy = sort
                ? sort.sorts.map((s) => ({ [s.field]: s.direction.toLowerCase() }))
                : [{ createdAt: 'desc' }];

            // include 관계 데이터들을 명시적으로 가져옴
            const posts = await prisma.post.findMany({
                where,
                take: limit || 10,
                skip: cursor ? 1 : 0,
                ...(cursor && { cursor: { id: parseInt(cursor, 10) } }),
                orderBy,
                include: {
                    categories: true,
                    tags: true,
                    likes: {
                        where: userId ? { userId } : undefined,
                        take: 1,
                    },
                },
            });

            const hasNextPage = posts.length === limit;
            const endCursor = hasNextPage ? posts[posts.length - 1].id.toString() : null;

            // 각 포스트에 대해 likedByMe를 명시적으로 계산
            const postsWithLikedByMe = posts.map((post) => ({
                ...post,
                likedByMe: Boolean(post.likes?.length > 0), // false로 기본값 설정
            }));

            return {
                posts: postsWithLikedByMe,
                pageInfo: { hasNextPage, endCursor },
            };
        },
    },
};
