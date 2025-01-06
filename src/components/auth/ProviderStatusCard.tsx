import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderStatus } from './types';

export function ProviderStatusCard({
  provider,
  hasCode,
  hasToken,
  providerId,
}: ProviderStatus) {
  return (
    <Card className="h-40 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <span>{provider}</span>
          <Badge
            variant={providerId ? 'default' : 'secondary'}
            className="ml-2"
          >
            {providerId ? '연동됨' : '미연동'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">승인 코드</span>
            <Badge variant={hasCode ? 'default' : 'outline'}>
              {hasCode ? '있음' : '없음'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">액세스 토큰</span>
            <Badge variant={hasToken ? 'default' : 'outline'}>
              {hasToken ? '있음' : '없음'}
            </Badge>
          </div>
          {providerId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider ID</span>
              <span className="max-w-[150px] truncate text-sm font-medium">
                {providerId}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
