'use client';

import { useState } from 'react';

interface Post {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    categories?: { name: string }[];
    tags?: { name: string }[];
    likedByMe?: boolean;
}

interface PageInfo {
    hasNextPage: boolean;
    endCursor: string | null;
}

export default function TestPage() {
    // 기본 CRUD 상태
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    // GraphQL 필터링 상태
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        hasNextPage: false,
        endCursor: null,
    });

    // 공통 상태
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 추가 상태
    const [categories, setCategories] = useState<string>(''); // 쉼표로 구분
    const [tags, setTags] = useState<string>(''); // 쉼표로 구분

    // REST API 호출 함수들
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts');
            const data = await response.json();
            if (response.ok) {
                setPosts(data);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '포스트 조회 실패');
        } finally {
            setLoading(false);
        }
    };

    // createPost 수정
    const createPost = async () => {
        try {
            setLoading(true);
            const categoryList = categories
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean);
            const tagList = tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    categories: categoryList,
                    tags: tagList,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setPosts([...posts, data]);
                setTitle('');
                setContent('');
                setCategories('');
                setTags('');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '포스트 생성 실패');
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async (id: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            const data = await response.json();

            if (response.ok) {
                setPosts(posts.map((post) => (post.id === id ? data : post)));
                setTitle('');
                setContent('');
                setEditingId(null);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '포스트 수정 실패');
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (id: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(posts.filter((post) => post.id !== id));
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '포스트 삭제 실패');
        } finally {
            setLoading(false);
        }
    };

    // GraphQL 쿼리 함수
    const fetchFilteredPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': '1', // 테스트용 고정 사용자 ID
                },
                body: JSON.stringify({
                    query: `
            query FilterPosts($filter: PostFilter, $sort: PostSortInput, $limit: Int, $cursor: String) {
              filterPosts(filter: $filter, sort: $sort, limit: $limit, cursor: $cursor) {
                posts {
                  id
                  title
                  content
                  createdAt
                  categories { name }
                  tags { name }
                  likedByMe
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `,
                    variables: {
                        filter: {
                            tags: tagFilter.length > 0 ? tagFilter : undefined,
                            categories: categoryFilter.length > 0 ? categoryFilter : undefined,
                            likedByUser: true,
                        },
                        sort: {
                            sorts: [{ field: sortField, direction: sortDirection }],
                        },
                        limit: 10,
                        cursor: pageInfo.endCursor,
                    },
                }),
            });

            const data = await response.json();

            if (data.errors) {
                throw new Error(data.errors[0].message);
            }

            setPosts(data.data.filterPosts.posts);
            setPageInfo(data.data.filterPosts.pageInfo);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'GraphQL 쿼리 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">기본 CRUD 테스트</h2>

                {/* CRUD 폼 */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목"
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용"
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        value={categories}
                        onChange={(e) => setCategories(e.target.value)}
                        placeholder="카테고리 (쉼표로 구분)"
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="태그 (쉼표로 구분)"
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <button
                        onClick={editingId ? () => updatePost(editingId) : createPost}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                        {editingId ? '수정' : '생성'}
                    </button>
                    <button
                        onClick={fetchPosts}
                        disabled={loading}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        전체 조회
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">GraphQL 필터 테스트</h2>

                {/* GraphQL 필터 폼 */}
                <div className="mb-4 space-y-2">
                    <input
                        type="text"
                        value={tagFilter.join(', ')}
                        onChange={(e) =>
                            setTagFilter(e.target.value.split(',').map((t) => t.trim()))
                        }
                        placeholder="태그 필터 (쉼표로 구분)"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        value={categoryFilter.join(', ')}
                        onChange={(e) =>
                            setCategoryFilter(e.target.value.split(',').map((c) => c.trim()))
                        }
                        placeholder="카테고리 필터 (쉼표로 구분)"
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex gap-2">
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="createdAt">작성일</option>
                            <option value="title">제목</option>
                        </select>
                        <select
                            value={sortDirection}
                            onChange={(e) => setSortDirection(e.target.value as 'ASC' | 'DESC')}
                            className="p-2 border rounded"
                        >
                            <option value="DESC">내림차순</option>
                            <option value="ASC">오름차순</option>
                        </select>
                        <button
                            onClick={fetchFilteredPosts}
                            disabled={loading}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            필터 적용
                        </button>
                    </div>
                </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* 포스트 목록 */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="border p-4 rounded"
                    >
                        <h3 className="text-xl font-semibold">{post.title}</h3>
                        <p className="mt-2">{post.content}</p>
                        {post.categories && (
                            <div className="mt-2 text-sm text-gray-600">
                                카테고리: {post.categories.map((cat) => cat.name).join(', ')}
                            </div>
                        )}
                        {post.tags && (
                            <div className="mt-1 text-sm text-blue-600">
                                태그: {post.tags.map((tag) => `#${tag.name}`).join(' ')}
                            </div>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                            작성일: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className="mt-2 space-x-2">
                            <button
                                onClick={() => {
                                    setEditingId(post.id);
                                    setTitle(post.title);
                                    setContent(post.content);
                                }}
                                className="text-blue-500"
                            >
                                수정
                            </button>
                            <button
                                onClick={() => deletePost(post.id)}
                                className="text-red-500"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이지네이션 */}
            {pageInfo.hasNextPage && (
                <button
                    onClick={fetchFilteredPosts}
                    className="mt-4 bg-gray-200 px-4 py-2 rounded"
                >
                    더 보기
                </button>
            )}
        </div>
    );
}
