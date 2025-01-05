"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/lib/auth/social/constants";

interface SocialLoginButtonProps {
  provider: AuthProvider;
  onClick: () => void;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onClick,
}) => {
  return (
    <Button onClick={onClick} variant="outline" className="w-full">
      {provider}로 로그인
    </Button>
  );
};

export default SocialLoginButton;
