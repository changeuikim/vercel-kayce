import { Resolvers } from '@/app/graphql/generated/types'; // Codegen으로 생성된 타입
import { prisma } from '@/lib/prisma'; // 싱글턴 Prisma Client 사용

export const mutationResolvers: Resolvers = {
    Mutation: {
        toggleLike: async (_, { postId }, { userId }) => {
            if (!userId) {
                throw new Error('Authentication required'); // 인증되지 않은 사용자 처리
            }

            // 이미 좋아요가 눌렸는지 확인
            const existingLike = await prisma.like.findUnique({
                where: { userId_postId: { userId, postId } }, // 복합 키로 조회
            });

            if (existingLike) {
                // 이미 좋아요가 눌렸다면 삭제
                await prisma.like.delete({ where: { id: existingLike.id } });
            } else {
                // 좋아요가 눌리지 않았다면 추가
                await prisma.like.create({ data: { userId, postId } });
            }

            // Prisma의 Post를 반환하도록 타입 맞춤
            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post) throw new Error('Post not found');
            return post;
        },

        toggleCategorySubscription: async (_, { categoryId }, { userId }) => {
            if (!userId) {
                throw new Error('Authentication required'); // 인증되지 않은 사용자 처리
            }

            // 이미 구독 중인지 확인
            const existingSubscription = await prisma.categorySubscription.findUnique({
                where: { userId_categoryId: { userId, categoryId } },
            });

            if (existingSubscription) {
                // 이미 구독 중이라면 삭제
                await prisma.categorySubscription.delete({
                    where: { id: existingSubscription.id },
                });
            } else {
                // 구독이 되어 있지 않다면 추가
                await prisma.categorySubscription.create({
                    data: { userId, categoryId },
                });
            }

            // Prisma의 Category를 반환하도록 타입 맞춤
            const category = await prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) throw new Error('Category not found');
            return category;
        },

        toggleTagSubscription: async (_, { tagId }, { userId }) => {
            if (!userId) {
                throw new Error('Authentication required'); // 인증되지 않은 사용자 처리
            }

            // 이미 구독 중인지 확인
            const existingSubscription = await prisma.tagSubscription.findUnique({
                where: { userId_tagId: { userId, tagId } },
            });

            if (existingSubscription) {
                // 이미 구독 중이라면 삭제
                await prisma.tagSubscription.delete({
                    where: { id: existingSubscription.id },
                });
            } else {
                // 구독이 되어 있지 않다면 추가
                await prisma.tagSubscription.create({ data: { userId, tagId } });
            }

            // Prisma의 Tag를 반환하도록 타입 맞춤
            const tag = await prisma.tag.findUnique({ where: { id: tagId } });
            if (!tag) throw new Error('Tag not found');
            return tag;
        },
    },
};
