import crypto from "crypto";
import { cookies } from "next/headers";

const STATE_COOKIE_PREFIX = "oauth_state_"; // 쿠키 이름의 접두사
const STATE_EXPIRY = 5 * 60; // 쿠키 만료 시간 (초 단위, 5분)

/**
 * OAuth 상태 관리 유틸리티
 * - CSRF 방지를 위한 `state` 값을 생성, 저장, 검증
 */
export interface StateManager {
  /**
   * 고유한 state 값 생성
   * @returns 랜덤한 state 문자열
   */
  generateState(): string;

  /**
   * state 값을 쿠키에 저장
   * @param state 생성된 state 값
   * @param provider OAuth 공급자 이름 (예: "GitHub")
   */
  saveState(state: string, provider: string): Promise<void>;

  /**
   * 전달된 state 값이 저장된 쿠키의 state 값과 일치하는지 검증
   * @param state 전달된 state 값
   * @param provider OAuth 공급자 이름 (예: "GitHub")
   * @returns state 값의 일치 여부
   */
  validateState(state: string, provider: string): Promise<boolean>;
}

/**
 * OAuth 상태 관리 구현체
 */
export const stateManager: StateManager = {
  /**
   * 랜덤한 고유 state 값 생성
   * - CSRF 방지를 위해 32바이트 길이의 난수를 생성
   */
  generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  },

  /**
   * state 값을 쿠키에 저장
   * - `STATE_COOKIE_PREFIX`와 공급자 이름을 조합해 쿠키 이름 생성
   * - 쿠키는 HTTP 전용, 보안 모드로 설정
   */
  async saveState(state: string, provider: string): Promise<void> {
    (await cookies()).set(STATE_COOKIE_PREFIX + provider, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: STATE_EXPIRY,
      path: "/", // 쿠키의 유효 경로
    });
  },

  /**
   * 저장된 state 값을 검증
   * - 전달된 state 값과 저장된 쿠키의 값을 비교
   */
  async validateState(state: string, provider: string): Promise<boolean> {
    const savedState = (await cookies()).get(STATE_COOKIE_PREFIX + provider);
    return savedState?.value === state;
  },
};
