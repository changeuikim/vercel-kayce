import { JWTPayload } from '@/lib/auth/user/types';

export interface UserJWTUtils {
    /**
     * 사용자 ID를 기반으로 Access Token 생성
     */
    generateAccessToken(userId: string): Promise<string>;

    /**
     * 사용자 ID를 기반으로 Refresh Token 생성
     */
    generateRefreshToken(userId: string): Promise<string>;

    /**
     * JWT 토큰의 유효성을 검증하고 페이로드를 반환
     */
    verifyToken(token: string): Promise<JWTPayload | null>;

    /**
     * Refresh Token을 통해 새로운 Access/Refresh Token 쌍 발급
     */
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;

    /**
     * JWT 토큰의 만료 여부 확인
     */
    isTokenExpired(token: string): boolean;

    /**
     * JWT 토큰에서 페이로드 추출 (검증 포함)
     */
    extractTokenPayload(token: string): Promise<JWTPayload>;

    /**
     * Authorization 헤더에서 JWT 토큰 추출
     */
    extractTokenFromHeader(authHeader: string | undefined): string | null;
}
