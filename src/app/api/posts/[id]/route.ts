import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface PrismaError {
  code: string;
  message: string;
  clientVersion?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, context: any) {
  const id = context.params.id;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { title, content } = await req.json();

  if (!title && !content) {
    return NextResponse.json(
      { error: "Title or content must be provided" },
      { status: 400 },
    );
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: { ...(title && { title }), ...(content && { content }) },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as PrismaError).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Post not found or cannot be updated" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
  const id = context.params.id;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const deletedPost = await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedPost, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as PrismaError).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Post not found or already deleted" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
