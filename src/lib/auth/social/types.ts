import { OAUTH_ENDPOINTS } from '@/lib/auth/social/constants';

export type OAuthProvider = keyof typeof OAUTH_ENDPOINTS;

export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scope: string[];
}

export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}

export interface RawUserProfile {
    id: string;
    [key: string]: any; // 각 공급자별 추가 필드
}

export interface SocialAuthError {
    code: string;
    message: string;
    provider: OAuthProvider;
    originalError?: any;
}
