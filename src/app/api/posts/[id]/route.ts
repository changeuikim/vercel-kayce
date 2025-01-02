import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface PrismaError {
    code: string;
    message: string;
    clientVersion?: string;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { title, content } = await request.json();

    if (!title && !content) {
        return NextResponse.json({ error: 'Title or content must be provided' }, { status: 400 });
    }

    try {
        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { ...(title && { title }), ...(content && { content }) },
        });

        return NextResponse.json(updatedPost, { status: 200 });
    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as PrismaError).code === 'P2025'
        ) {
            return NextResponse.json(
                { error: 'Post not found or cannot be updated' },
                { status: 404 }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const deletedPost = await prisma.post.delete({
            where: { id: Number(id) },
        });

        return NextResponse.json(deletedPost, { status: 200 });
    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as PrismaError).code === 'P2025'
        ) {
            return NextResponse.json(
                { error: 'Post not found or already deleted' },
                { status: 404 }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
