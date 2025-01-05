import { OAuthProvider, OAuthTokenResponse, RawUserProfile } from '@/lib/auth/social/types';

export interface SocialAuthProvider {
    /**
     * OAuth 인증 URL 생성
     */
    getAuthorizationUrl(state?: string): string;

    /**
     * Authorization Code로 Access Token 교환
     */
    getAccessToken(code: string, state?: string): Promise<OAuthTokenResponse>;

    /**
     * Access Token으로 사용자 프로필 조회
     */
    getUserProfile(accessToken: string): Promise<RawUserProfile>;

    /**
     * 프로필에서 providerId 추출 (표준화)
     */
    extractProviderId(profile: RawUserProfile): string;
}

export interface SocialAuthService {
    /**
     * OAuth Flow 초기화
     */
    initiateAuth(provider: OAuthProvider, state?: string): Promise<string>;

    /**
     * OAuth Callback 처리
     */
    handleCallback(provider: OAuthProvider, code: string, state?: string): Promise<string>; // userId 반환

    /**
     * Access Token 검증
     */
    validateToken(provider: OAuthProvider, accessToken: string): Promise<boolean>;
}
