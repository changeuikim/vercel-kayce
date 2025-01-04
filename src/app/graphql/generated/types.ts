import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User as PrismaUser } from '@prisma/client';
import { Context } from '@/lib/graphql/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  users: UserConnection;
};


export type QueryUsersArgs = {
  filter: InputMaybe<UserFilter>;
  pagination: UserPaginationInput;
  sort: InputMaybe<Array<UserSort>>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  deletedAt: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<UserEdge>;
  errors: Maybe<Array<UserError>>;
  executionTime: Maybe<Scalars['Int']['output']>;
  pageInfo: PageInfo;
  queryComplexity: Maybe<Scalars['Int']['output']>;
  totalCount: Scalars['Int']['output'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export type UserError = {
  __typename?: 'UserError';
  code: Scalars['String']['output'];
  field: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
};

export type UserFilter = {
  AND: InputMaybe<Array<UserFilter>>;
  OR: InputMaybe<Array<UserFilter>>;
  createdAtAfter: InputMaybe<Scalars['DateTime']['input']>;
  createdAtBefore: InputMaybe<Scalars['DateTime']['input']>;
  deletedAtAfter: InputMaybe<Scalars['DateTime']['input']>;
  deletedAtBefore: InputMaybe<Scalars['DateTime']['input']>;
  isDeleted: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserPaginationInput = {
  after: InputMaybe<Scalars['String']['input']>;
  before: InputMaybe<Scalars['String']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
};

export type UserSort = {
  direction: SortDirection;
  field: UserSortableField;
};

export enum UserSortableField {
  CreatedAt = 'CREATED_AT',
  DeletedAt = 'DELETED_AT'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<PrismaUser>;
  UserConnection: ResolverTypeWrapper<Omit<UserConnection, 'edges'> & { edges: Array<ResolversTypes['UserEdge']> }>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>;
  UserError: ResolverTypeWrapper<UserError>;
  UserFilter: UserFilter;
  UserPaginationInput: UserPaginationInput;
  UserSort: UserSort;
  UserSortableField: UserSortableField;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  PageInfo: PageInfo;
  Query: {};
  String: Scalars['String']['output'];
  User: PrismaUser;
  UserConnection: Omit<UserConnection, 'edges'> & { edges: Array<ResolversParentTypes['UserEdge']> };
  UserEdge: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] };
  UserError: UserError;
  UserFilter: UserFilter;
  UserPaginationInput: UserPaginationInput;
  UserSort: UserSort;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  users: Resolver<ResolversTypes['UserConnection'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'pagination'>>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDeleted: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserConnectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserConnection'] = ResolversParentTypes['UserConnection']> = {
  edges: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  errors: Resolver<Maybe<Array<ResolversTypes['UserError']>>, ParentType, ContextType>;
  executionTime: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pageInfo: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  queryComplexity: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalCount: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = {
  cursor: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserError'] = ResolversParentTypes['UserError']> = {
  code: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  field: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  DateTime: GraphQLScalarType;
  PageInfo: PageInfoResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  User: UserResolvers<ContextType>;
  UserConnection: UserConnectionResolvers<ContextType>;
  UserEdge: UserEdgeResolvers<ContextType>;
  UserError: UserErrorResolvers<ContextType>;
};

