import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/*
src/
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   ├── route.ts        # POST /api/posts
│   │   │   ├── [id]/           # /api/posts/:id
│   │   │   │   └── route.ts    # PUT/DELETE /api/posts/:id
│   │   └── ...                 # 추가 API
│   └── ...                     # Next.js App Router 관련 파일
├── lib/
│   └── prisma.ts               # Prisma Client 초기화
└── prisma/
    ├── schema.prisma           # Prisma Schema
    └── migrations/             # 마이그레이션 파일
*/
