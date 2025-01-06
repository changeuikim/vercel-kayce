export type OAuthProvider = 'Github' | 'Google' | 'Kakao' | 'Naver';

export interface ProviderStatus {
  provider: OAuthProvider;
  hasCode: boolean;
  hasToken: boolean;
  providerId?: string;
}
