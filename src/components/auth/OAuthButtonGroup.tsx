import { Button } from '@/components/ui/button';
import { OAuthProvider } from './types';

const PROVIDER_CONFIGS: Record<
  OAuthProvider,
  { text: string; className?: string }
> = {
  Github: { text: 'Github로 계속하기' },
  Google: { text: 'Google로 계속하기' },
  Kakao: {
    text: 'Kakao로 계속하기',
    className: 'bg-[#FEE500] hover:bg-[#FEE500]/90 text-black',
  },
  Naver: {
    text: 'Naver로 계속하기',
    className: 'bg-[#03C75A] hover:bg-[#03C75A]/90 text-white',
  },
};

interface OAuthButtonGroupProps {
  onProviderSelect: (provider: OAuthProvider) => void;
  isLoading?: boolean;
}

export function OAuthButtonGroup({
  onProviderSelect,
  isLoading,
}: OAuthButtonGroupProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(PROVIDER_CONFIGS) as OAuthProvider[]).map((provider) => (
        <Button
          key={provider}
          variant={
            provider === 'Kakao' || provider === 'Naver' ? 'default' : 'outline'
          }
          className={PROVIDER_CONFIGS[provider].className}
          disabled={isLoading}
          onClick={() => onProviderSelect(provider)}
        >
          {PROVIDER_CONFIGS[provider].text}
        </Button>
      ))}
    </div>
  );
}
