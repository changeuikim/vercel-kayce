# Vercel Kayce

Next.js 15와 React 19 기반의 정적 블로그 시스템

## 기술 스택

### Core

-   Next.js 15
-   React 19
-   TypeScript 5
-   Node.js 20 LTS

### Frontend

-   Tailwind CSS
-   Shadcn/ui
-   MDX

### Backend

-   GraphQL Yoga
-   Next Auth
-   Vercel Postgres
-   Giscus (GitHub Discussions)

## 주요 특징

-   MDX 기반 콘텐츠 관리
-   전체 페이지 정적 생성 (SSG)
-   매일 새벽 3시 전체 페이지 재빌드 (cron)

## 프로젝트 구조

```bash
src/
├── app/                # Next.js App Router
│   ├── api/            # API Routes
│   │   └── graphql/    # GraphQL Endpoint
│   ├── posts/          # 블로그 포스트
│   ├── tags/           # 태그별 보기
│   └── series/         # 시리즈별 보기
├── components/         # React 컴포넌트
├── graphql/            # GraphQL 정의
└── lib/                # 유틸리티
```

## 환경 변수

```bash
DATABASE_URL=          # Vercel Postgres
NEXTAUTH_SECRET=       # Next Auth
GITHUB_ID=             # GitHub OAuth
GITHUB_SECRET=         # GitHub OAuth
GISCUS_REPO=           # Giscus
GISCUS_REPO_ID=        # Giscus
```

## 배포

-   Vercel
-   Vercel Cron (매일 새벽 3시 재빌드)
