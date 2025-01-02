import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { title, content, categories, tags } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                categories: {
                    connectOrCreate: categories.map((name: string) => ({
                        where: { name },
                        create: { name },
                    })),
                },
                tags: {
                    connectOrCreate: tags.map((name: string) => ({
                        where: { name },
                        create: { name },
                    })),
                },
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
        const posts = await prisma.post.findMany();
        return NextResponse.json(posts, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to fetch posts', details: errorMessage },
            { status: 500 }
        );
    }
}
