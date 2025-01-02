import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Post as PrismaPost, Category as PrismaCategory, Tag as PrismaTag, User as PrismaUser, Like as PrismaLike } from '@prisma/client';
import { Context } from '@/lib/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

export type Category = {
  __typename?: 'Category';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  posts: Array<Post>;
  subscribedByMe: Scalars['Boolean']['output'];
  subscriberCount: Scalars['Int']['output'];
};

export type DateRangeInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
};

export type FeedResponse = {
  __typename?: 'FeedResponse';
  pageInfo: PageInfo;
  posts: Array<Post>;
};

export type Like = {
  __typename?: 'Like';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  post: Post;
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  toggleCategorySubscription?: Maybe<Category>;
  toggleLike?: Maybe<Post>;
  toggleTagSubscription?: Maybe<Tag>;
};


export type MutationToggleCategorySubscriptionArgs = {
  categoryId: Scalars['Int']['input'];
};


export type MutationToggleLikeArgs = {
  postId: Scalars['Int']['input'];
};


export type MutationToggleTagSubscriptionArgs = {
  tagId: Scalars['Int']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Post = {
  __typename?: 'Post';
  categories?: Maybe<Array<Category>>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  likedByMe: Scalars['Boolean']['output'];
  likes?: Maybe<Array<Like>>;
  tags?: Maybe<Array<Tag>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PostFilter = {
  authorId?: InputMaybe<Scalars['Int']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dateRange?: InputMaybe<DateRangeInput>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  likedByUser?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PostSort = {
  direction: SortDirection;
  field: Scalars['String']['input'];
};

export type PostSortInput = {
  sorts: Array<PostSort>;
};

export type Query = {
  __typename?: 'Query';
  filterPosts: FeedResponse;
};


export type QueryFilterPostsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<PostFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<PostSortInput>;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  posts: Array<Post>;
  subscribedByMe: Scalars['Boolean']['output'];
  subscriberCount: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  categorySubscriptions: Array<Category>;
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  likedPosts: Array<Post>;
  name: Scalars['String']['output'];
  tagSubscriptions: Array<Tag>;
};



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
  Category: ResolverTypeWrapper<PrismaCategory>;
  DateRangeInput: DateRangeInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  FeedResponse: ResolverTypeWrapper<Omit<FeedResponse, 'posts'> & { posts: Array<ResolversTypes['Post']> }>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Like: ResolverTypeWrapper<PrismaLike>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Post: ResolverTypeWrapper<PrismaPost>;
  PostFilter: PostFilter;
  PostSort: PostSort;
  PostSortInput: PostSortInput;
  Query: ResolverTypeWrapper<{}>;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Tag: ResolverTypeWrapper<PrismaTag>;
  User: ResolverTypeWrapper<PrismaUser>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Category: PrismaCategory;
  DateRangeInput: DateRangeInput;
  DateTime: Scalars['DateTime']['output'];
  FeedResponse: Omit<FeedResponse, 'posts'> & { posts: Array<ResolversParentTypes['Post']> };
  Int: Scalars['Int']['output'];
  Like: PrismaLike;
  Mutation: {};
  PageInfo: PageInfo;
  Post: PrismaPost;
  PostFilter: PostFilter;
  PostSort: PostSort;
  PostSortInput: PostSortInput;
  Query: {};
  String: Scalars['String']['output'];
  Tag: PrismaTag;
  User: PrismaUser;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  posts?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  subscribedByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  subscriberCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type FeedResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FeedResponse'] = ResolversParentTypes['FeedResponse']> = {
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  posts?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LikeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Like'] = ResolversParentTypes['Like']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  post?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  toggleCategorySubscription?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<MutationToggleCategorySubscriptionArgs, 'categoryId'>>;
  toggleLike?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, RequireFields<MutationToggleLikeArgs, 'postId'>>;
  toggleTagSubscription?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType, RequireFields<MutationToggleTagSubscriptionArgs, 'tagId'>>;
};

export type PageInfoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post']> = {
  categories?: Resolver<Maybe<Array<ResolversTypes['Category']>>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  likedByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  likes?: Resolver<Maybe<Array<ResolversTypes['Like']>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['Tag']>>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  filterPosts?: Resolver<ResolversTypes['FeedResponse'], ParentType, ContextType, Partial<QueryFilterPostsArgs>>;
};

export type TagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  posts?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  subscribedByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  subscriberCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  categorySubscriptions?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  likedPosts?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tagSubscriptions?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Category?: CategoryResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  FeedResponse?: FeedResponseResolvers<ContextType>;
  Like?: LikeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

