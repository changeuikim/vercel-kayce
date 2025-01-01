import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, context: { params: { id: string } }) {
    const { params } = context;
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { title, content } = await req.json();

    if (!title && !content) {
        return NextResponse.json({ error: 'Title or content must be provided' }, { status: 400 });
    }

    try {
        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { ...(title && { title }), ...(content && { content }) },
        });

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Post not found or cannot be updated' },
                { status: 404 }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
    const { params } = context;
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const deletedPost = await prisma.post.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json(deletedPost, { status: 200 });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Post not found or already deleted' },
                { status: 404 }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}