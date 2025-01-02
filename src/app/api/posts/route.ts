import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface CreatePostRequest {
    title: string;
    content: string;
    categories?: string[];
    tags?: string[];
}

export async function POST(req: NextRequest) {
    try {
        const { title, content, categories = [], tags = [] }: CreatePostRequest = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                categories:
                    categories.length > 0
                        ? {
                              connectOrCreate: categories.map((name) => ({
                                  where: { name },
                                  create: { name },
                              })),
                          }
                        : undefined,
                tags:
                    tags.length > 0
                        ? {
                              connectOrCreate: tags.map((name) => ({
                                  where: { name },
                                  create: { name },
                              })),
                          }
                        : undefined,
            },
            include: {
                categories: true,
                tags: true,
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to create post', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                categories: true,
                tags: true,
            },
        });
        return NextResponse.json(posts, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to fetch posts', details: errorMessage },
            { status: 500 }
        );
    }
}
