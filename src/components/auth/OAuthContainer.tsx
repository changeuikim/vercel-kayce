import { useState } from 'react';
import { OAuthProvider, ProviderStatus } from './types';
import { ProviderStatusCard } from './ProviderStatusCard';
import { OAuthButtonGroup } from './OAuthButtonGroup';
import { useToast } from '@/hooks/use-toast';

export function OAuthContainer() {
  const [providerStatuses, setProviderStatuses] = useState<
    Record<OAuthProvider, ProviderStatus>
  >({
    Github: { provider: 'Github', hasCode: false, hasToken: false },
    Google: { provider: 'Google', hasCode: false, hasToken: false },
    Kakao: { provider: 'Kakao', hasCode: false, hasToken: false },
    Naver: { provider: 'Naver', hasCode: false, hasToken: false },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProviderSelect = async (provider: OAuthProvider) => {
    setIsLoading(true);
    try {
      // OAuth 로그인 로직 구현
      // 성공 시 상태 업데이트
      toast({
        title: '로그인 시도',
        description: `${provider} 로그인을 시도합니다.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: '로그인 처리 중 문제가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-2/3 space-y-8 p-6">
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(providerStatuses) as OAuthProvider[]).map((provider) => (
          <ProviderStatusCard key={provider} {...providerStatuses[provider]} />
        ))}
      </div>
      <OAuthButtonGroup
        onProviderSelect={handleProviderSelect}
        isLoading={isLoading}
      />
    </div>
  );
}
