"use client";

import React, { useEffect, useState } from "react";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { AuthProvider } from "@/lib/auth/social/constants";
import { useSearchParams } from "next/navigation";

const SocialLoginTestPage = () => {
  const searchParams = useSearchParams();

  // 상태 관리
  const [results, setResults] = useState<
    Record<
      AuthProvider,
      {
        code: string | null;
        accessToken: string | null;
        providerId: string | null;
      }
    >
  >({
    [AuthProvider.github]: { code: null, accessToken: null, providerId: null },
    [AuthProvider.google]: { code: null, accessToken: null, providerId: null },
    [AuthProvider.kakao]: { code: null, accessToken: null, providerId: null },
    [AuthProvider.naver]: { code: null, accessToken: null, providerId: null },
  });

  // URL 파라미터에서 code와 state 감지
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (code) {
      console.log("인증 코드 받음:", code);
      // 여기서 state 검증도 가능
    }

    if (error) {
      console.error("인증 에러:", error);
    }
  }, [searchParams]);

  const handleLogin = (provider: AuthProvider) => {
    // 단순 리다이렉션
    window.location.href = `/api/auth/social/${provider.toLowerCase()}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* 버튼 영역 */}
      <div className="grid grid-cols-4 gap-4">
        {Object.values(AuthProvider).map((provider) => (
          <SocialLoginButton
            key={provider}
            provider={provider}
            onClick={() => handleLogin(provider)}
          />
        ))}
      </div>
    </div>
  );
};

export default SocialLoginTestPage;
