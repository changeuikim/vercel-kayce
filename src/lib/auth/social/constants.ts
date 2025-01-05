export enum AuthProvider {
  github = "github",
  google = "google",
  kakao = "kakao",
  naver = "naver",
}

export const OAUTH_CONFIG = {
  github: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
    REDIRECT_URI: process.env.GITHUB_REDIRECT_URI!,
  },
  google: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,
  },
  kakao: {
    CLIENT_ID: process.env.KAKAO_CLIENT_ID!,
    CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET!,
    REDIRECT_URI: process.env.KAKAO_REDIRECT_URI!,
  },
  naver: {
    CLIENT_ID: process.env.NAVER_CLIENT_ID!,
    CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET!,
    REDIRECT_URI: process.env.NAVER_REDIRECT_URI!,
  },
} as const;

export const OAUTH_ENDPOINTS = {
  github: {
    AUTH_URL: "https://github.com/login/oauth/authorize",
    TOKEN_URL: "https://github.com/login/oauth/access_token",
    USER_INFO_URL: "https://api.github.com/user",
  },
  google: {
    AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    TOKEN_URL: "https://oauth2.googleapis.com/token",
    USER_INFO_URL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  kakao: {
    AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
    TOKEN_URL: "https://kauth.kakao.com/oauth/token",
    USER_INFO_URL: "https://kapi.kakao.com/v2/user/me",
  },
  naver: {
    AUTH_URL: "https://nid.naver.com/oauth2.0/authorize",
    TOKEN_URL: "https://nid.naver.com/oauth2.0/token",
    USER_INFO_URL: "https://openapi.naver.com/v1/nid/me",
  },
} as const;

export const OAUTH_SCOPES = {
  github: ["read:user"],
  google: ["openid"],
  kakao: [""],
  naver: ["profile"],
} as const;
