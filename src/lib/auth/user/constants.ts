export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'; // 환경 변수에서 가져옴
export const JWT_ISSUER = 'vercel-kayce'; // 토큰 발급자

// 액세스 토큰 만료 시간 (1시간)
export const ACCESS_TOKEN_EXPIRATION = 60 * 60;

// 리프레시 토큰 만료 시간 (1일)
export const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 1;
