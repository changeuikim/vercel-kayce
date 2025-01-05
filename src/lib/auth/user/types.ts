export interface JWTPayload {
    userId: string; // 사용자 고유 ID
    type: 'access' | 'refresh'; // 토큰 타입
    iat?: number; // 발급 시간
    exp?: number; // 만료 시간
}

// JWT 옵션 타입
export interface JWTOptions {
    expiresIn?: number; // 만료 시간 (초 단위)
    issuer?: string; // 발급자
    audience?: string; // 대상자
}
