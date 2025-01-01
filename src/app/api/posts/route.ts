import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const newPost = await prisma.post.create({
            data: { title, content },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to create post', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const posts = await prisma.post.findMany();
        return NextResponse.json(posts, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch posts', details: error.message },
            { status: 500 }
        );
    }
}
