"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { AuthProvider } from "@/lib/auth/social/constants";

const SocialLoginDialog = () => {
  const [open, setOpen] = useState(false);

  const handleLogin = (provider: AuthProvider) => {
    // OAuth URL 리다이렉션
    window.location.href = `/api/auth/social/${provider.toLowerCase()}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 text-white bg-blue-500 rounded">
          소셜 로그인 열기
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>소셜 로그인</DialogTitle>
        <DialogDescription>아래 버튼 중 하나를 선택하세요:</DialogDescription>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {Object.values(AuthProvider).map((provider) => (
            <SocialLoginButton
              key={provider}
              provider={provider}
              onClick={() => handleLogin(provider)}
            />
          ))}
        </div>
        <DialogClose asChild>
          <button className="mt-4 px-4 py-2 text-white bg-gray-500 rounded">
            닫기
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLoginDialog;
