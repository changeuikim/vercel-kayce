import gql from 'graphql-tag';

export const typeDefs = gql`
  # 복합 필터링 및 정렬을 위한 입력 타입
  input PostFilter {
    tags: [String]
    categories: [String]
    likedByUser: Boolean
    authorId: Int
    dateRange: DateRangeInput
    keyword: String
  }

  # 날짜 범위 필터링을 위한 입력 타입
  input DateRangeInput {
    start: DateTime
    end: DateTime
  }

  # 복합 정렬 조건을 위한 입력 타입
  input PostSort {
    field: String!
    direction: SortDirection!
  }

  # 복합 정렬 조건의 배열을 지원
  input PostSortInput {
    sorts: [PostSort!]!
  }

  # 정렬 방향 정의
  enum SortDirection {
    ASC
    DESC
  }

  # 게시글 타입
  type Post {
    id: Int!
    title: String!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    categories: [Category!]
    tags: [Tag!]
    likes: [Like!]
    likedByMe: Boolean!
  }

  # 카테고리 타입
  type Category {
    id: Int!
    name: String!
    posts: [Post!]!
    subscriberCount: Int!
    subscribedByMe: Boolean!
  }

  # 태그 타입
  type Tag {
    id: Int!
    name: String!
    posts: [Post!]!
    subscriberCount: Int!
    subscribedByMe: Boolean!
  }

  # 좋아요 타입
  type Like {
    id: Int!
    post: Post!
    user: User!
    createdAt: DateTime!
  }

  # 사용자 타입
  type User {
    id: Int!
    name: String!
    email: String!
    likedPosts: [Post!]!
    categorySubscriptions: [Category!]!
    tagSubscriptions: [Tag!]!
  }

  # 게시글 목록과 페이징 정보를 포함한 응답 타입
  type FeedResponse {
    posts: [Post!]!
    pageInfo: PageInfo!
  }

  # 페이징 정보 타입
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  # Query 타입에 복합 조건 필터링 및 정렬 지원
  type Query {
    filterPosts(
      filter: PostFilter
      sort: PostSortInput
      limit: Int
      cursor: String
    ): FeedResponse!
  }

  # Mutation 타입 추가
  type Mutation {
    toggleLike(postId: Int!): Post
    toggleCategorySubscription(categoryId: Int!): Category
    toggleTagSubscription(tagId: Int!): Tag
  }

  scalar DateTime
`;
