-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GITHUB', 'GOOGLE', 'KAKAO', 'NAVER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DEMO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "providerId" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "apiKey" TEXT,
    "refreshToken" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JwtBlacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JwtBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- CreateIndex
CREATE INDEX "User_email_provider_idx" ON "User"("email", "provider");

-- CreateIndex
CREATE INDEX "User_apiKey_idx" ON "User"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "JwtBlacklist_token_key" ON "JwtBlacklist"("token");

-- CreateIndex
CREATE INDEX "JwtBlacklist_token_idx" ON "JwtBlacklist"("token");

-- CreateIndex
CREATE INDEX "JwtBlacklist_userId_expiresAt_idx" ON "JwtBlacklist"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "JwtBlacklist" ADD CONSTRAINT "JwtBlacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
