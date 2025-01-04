import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import {
    Resolvers,
    UserSortableField,
    SortDirection,
    Maybe,
    Omit,
    PageInfo,
    ResolversParentTypes,
    ResolversTypes,
    ResolverTypeWrapper,
    UserConnection,
    UserEdge,
    UserError,
    UserFilter,
    UserSort,
} from '@/app/graphql/generated/types';
import { Context } from '@/lib/graphql/context';
import { $Enums, Prisma } from '@prisma/client';
import { withGraphQLErrorHandler } from '@/lib/error/graphql-error-handler';

export const userResolvers: Resolvers = {
    Query: {
        users: async (_parent: unknown, args: any, context: Context, info: GraphQLResolveInfo) => {
            return await withGraphQLErrorHandler(
                async () => {
                    const { filter, sort, pagination } = args;

                    // 1. Prisma where 절 구성
                    const where: Prisma.UserWhereInput = {};

                    if (filter) {
                        if (filter.isDeleted !== undefined) {
                            where.isDeleted = filter.isDeleted;
                        }

                        // 생성일자 필터링
                        if (filter.createdAtBefore || filter.createdAtAfter) {
                            where.createdAt = {
                                ...(filter.createdAtBefore && {
                                    lte: new Date(filter.createdAtBefore),
                                }),
                                ...(filter.createdAtAfter && {
                                    gte: new Date(filter.createdAtAfter),
                                }),
                            };
                        }

                        // 삭제일자 필터링
                        if (filter.deletedAtBefore || filter.deletedAtAfter) {
                            where.deletedAt = {
                                ...(filter.deletedAtBefore && {
                                    lte: new Date(filter.deletedAtBefore),
                                }),
                                ...(filter.deletedAtAfter && {
                                    gte: new Date(filter.deletedAtAfter),
                                }),
                            };
                        }

                        // AND/OR 조건
                        if (filter.AND) {
                            where.AND = filter.AND.map((andFilter: UserFilter) =>
                                buildWhereInput(andFilter)
                            );
                        }
                        if (filter.OR) {
                            where.OR = filter.OR.map((orFilter: UserFilter) =>
                                buildWhereInput(orFilter)
                            );
                        }
                    }

                    // 2. 정렬 조건 구성
                    const orderBy = sort?.map((s: UserSort) => ({
                        [s.field === UserSortableField.CreatedAt ? 'createdAt' : 'deletedAt']:
                            s.direction === SortDirection.Asc ? 'asc' : 'desc',
                    }));

                    // 3. 페이지네이션 처리
                    const { first, last, before, after } = pagination;
                    const take = first || last || 10;

                    const paginationArgs: Prisma.UserFindManyArgs = {
                        take: take + 1, // hasNext 확인용 추가 데이터
                        where,
                        orderBy,
                    };

                    if (after) {
                        paginationArgs.cursor = { id: after };
                        paginationArgs.skip = 1; // cursor 이후부터
                    } else if (before) {
                        paginationArgs.cursor = { id: before };
                        paginationArgs.skip = 1;
                        if (last) {
                            paginationArgs.take = -(take + 1);
                        }
                    }

                    // 4. 실행 시작 시간 기록
                    const startTime = Date.now();

                    // 5. 데이터 조회 실행
                    const [users, totalCount] = await Promise.all([
                        context.prisma.user.findMany(paginationArgs),
                        context.prisma.user.count({ where }),
                    ]);

                    // 6. hasNext 확인 및 추가 데이터 제거
                    const hasNextPage = users.length > take;
                    if (hasNextPage) {
                        users.pop();
                    }

                    // 7. 응답 구성
                    return {
                        edges: users.map((user) => ({
                            node: user,
                            cursor: user.id,
                        })),
                        pageInfo: {
                            hasNextPage,
                            hasPreviousPage: Boolean(after || before),
                            startCursor: users[0]?.id ?? null,
                            endCursor: users[users.length - 1]?.id ?? null,
                        },
                        totalCount,
                        queryComplexity: calculateQueryComplexity(filter, sort, pagination),
                        executionTime: Date.now() - startTime,
                        errors: [], // 정상 실행 시 빈 배열
                    };
                },
                String(info.path.key),
                info.operation.name?.value
            );
        },
    },
    DateTime: new GraphQLScalarType<Date | null, string>({
        name: 'DateTime',
        description: 'DateTime custom scalar type',

        serialize(value: unknown): string {
            if (value instanceof Date) {
                return value.toISOString();
            }
            throw new Error('GraphQL Date Scalar serializer expected a `Date` object');
        },

        parseValue(value: unknown): Date | null {
            if (typeof value === 'string') {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date string');
                }
                return date;
            }
            throw new Error('GraphQL Date Scalar parser expected a `string`');
        },

        parseLiteral(ast): Date | null {
            if (ast.kind === 'StringValue') {
                const date = new Date(ast.value);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date string');
                }
                return date;
            }
            return null;
        },
    }),
    PageInfo: {
        endCursor: function (
            parent: PageInfo,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<string>> | Promise<Maybe<ResolverTypeWrapper<string>>> {
            throw new Error('Function not implemented.');
        },
        hasNextPage: function (
            parent: PageInfo,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<boolean> | Promise<ResolverTypeWrapper<boolean>> {
            throw new Error('Function not implemented.');
        },
        hasPreviousPage: function (
            parent: PageInfo,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<boolean> | Promise<ResolverTypeWrapper<boolean>> {
            throw new Error('Function not implemented.');
        },
        startCursor: function (
            parent: PageInfo,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<string>> | Promise<Maybe<ResolverTypeWrapper<string>>> {
            throw new Error('Function not implemented.');
        },
        __isTypeOf: undefined,
    },
    User: {
        createdAt: function (
            parent: {
                id: string;
                provider: $Enums.AuthProvider;
                providerIdHash: string;
                createdAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<Date> | Promise<ResolverTypeWrapper<Date>> {
            throw new Error('Function not implemented.');
        },
        deletedAt: function (
            parent: {
                id: string;
                provider: $Enums.AuthProvider;
                providerIdHash: string;
                createdAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<Date>> | Promise<Maybe<ResolverTypeWrapper<Date>>> {
            throw new Error('Function not implemented.');
        },
        id: function (
            parent: {
                id: string;
                provider: $Enums.AuthProvider;
                providerIdHash: string;
                createdAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<string> | Promise<ResolverTypeWrapper<string>> {
            throw new Error('Function not implemented.');
        },
        isDeleted: function (
            parent: {
                id: string;
                provider: $Enums.AuthProvider;
                providerIdHash: string;
                createdAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<boolean> | Promise<ResolverTypeWrapper<boolean>> {
            throw new Error('Function not implemented.');
        },
        __isTypeOf: undefined,
    },
    UserConnection: {
        edges: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ):
            | ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>[]
            | Promise<
                  ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>[]
              > {
            throw new Error('Function not implemented.');
        },
        errors: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ):
            | Maybe<ResolverTypeWrapper<UserError>[]>
            | Promise<Maybe<ResolverTypeWrapper<UserError>[]>> {
            throw new Error('Function not implemented.');
        },
        executionTime: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<number>> | Promise<Maybe<ResolverTypeWrapper<number>>> {
            throw new Error('Function not implemented.');
        },
        pageInfo: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<PageInfo> | Promise<ResolverTypeWrapper<PageInfo>> {
            throw new Error('Function not implemented.');
        },
        queryComplexity: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<number>> | Promise<Maybe<ResolverTypeWrapper<number>>> {
            throw new Error('Function not implemented.');
        },
        totalCount: function (
            parent: Omit<UserConnection, 'edges'> & {
                edges: Array<ResolversParentTypes['UserEdge']>;
            },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<number> | Promise<ResolverTypeWrapper<number>> {
            throw new Error('Function not implemented.');
        },
        __isTypeOf: undefined,
    },
    UserEdge: {
        cursor: function (
            parent: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<string> | Promise<ResolverTypeWrapper<string>> {
            throw new Error('Function not implemented.');
        },
        node: function (
            parent: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] },
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ):
            | ResolverTypeWrapper<{
                  id: string;
                  provider: $Enums.AuthProvider;
                  providerIdHash: string;
                  createdAt: Date;
                  isDeleted: boolean;
                  deletedAt: Date | null;
              }>
            | Promise<
                  ResolverTypeWrapper<{
                      id: string;
                      provider: $Enums.AuthProvider;
                      providerIdHash: string;
                      createdAt: Date;
                      isDeleted: boolean;
                      deletedAt: Date | null;
                  }>
              > {
            throw new Error('Function not implemented.');
        },
        __isTypeOf: undefined,
    },
    UserError: {
        code: function (
            parent: UserError,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<string> | Promise<ResolverTypeWrapper<string>> {
            throw new Error('Function not implemented.');
        },
        field: function (
            parent: UserError,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): Maybe<ResolverTypeWrapper<string>> | Promise<Maybe<ResolverTypeWrapper<string>>> {
            throw new Error('Function not implemented.');
        },
        message: function (
            parent: UserError,
            args: {},
            context: Context,
            info: GraphQLResolveInfo
        ): ResolverTypeWrapper<string> | Promise<ResolverTypeWrapper<string>> {
            throw new Error('Function not implemented.');
        },
        __isTypeOf: undefined,
    },
};

// 헬퍼 함수들
function buildWhereInput(filter: UserFilter): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    // null 체크를 추가하여 isDeleted 처리
    if (filter.isDeleted !== undefined && filter.isDeleted !== null) {
        where.isDeleted = filter.isDeleted;
    }

    // 생성일자 필터링
    if (filter.createdAtBefore || filter.createdAtAfter) {
        where.createdAt = {
            ...(filter.createdAtBefore && { lte: new Date(filter.createdAtBefore) }),
            ...(filter.createdAtAfter && { gte: new Date(filter.createdAtAfter) }),
        };
    }

    // 삭제일자 필터링
    if (filter.deletedAtBefore || filter.deletedAtAfter) {
        where.deletedAt = {
            ...(filter.deletedAtBefore && { lte: new Date(filter.deletedAtBefore) }),
            ...(filter.deletedAtAfter && { gte: new Date(filter.deletedAtAfter) }),
        };
    }

    // AND/OR 조건 처리 시에도 null 체크 추가
    if (filter.AND?.length) {
        where.AND = filter.AND.filter((f): f is UserFilter => f !== null).map(buildWhereInput);
    }

    if (filter.OR?.length) {
        where.OR = filter.OR.filter((f): f is UserFilter => f !== null).map(buildWhereInput);
    }

    return where;
}

function calculateQueryComplexity(filter?: any, sort?: any, pagination?: any): number {
    let complexity = 1;
    if (filter) {
        complexity += Object.keys(filter).length;
        if (filter.AND) complexity += filter.AND.length;
        if (filter.OR) complexity += filter.OR.length;
    }
    if (sort) complexity += sort.length;
    if (pagination)
        complexity += Object.keys(pagination).filter((k) => pagination[k] !== undefined).length;

    return complexity;
}
