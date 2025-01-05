import { NextResponse } from 'next/server';
import { stateManager } from '@/lib/auth/common/cookieUtils';
import { OAUTH_CONFIG, OAUTH_ENDPOINTS, AuthProvider } from '@/lib/auth/social/constants';

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
    try {
        const { provider } = await params;
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // 필수 파라미터 검증
        if (!code || !state) {
            return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
        }

        // provider 검증
        if (!(provider in AuthProvider)) {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
        }

        const selectedProvider = provider as AuthProvider;

        // state 검증
        if (!stateManager.validateState(state, selectedProvider)) {
            return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        }

        // Access Token 요청
        const tokenResponse = await fetch(OAUTH_ENDPOINTS[selectedProvider].TOKEN_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json', // 명시적으로 JSON 응답 요청
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: OAUTH_CONFIG[selectedProvider].CLIENT_ID,
                client_secret: OAUTH_CONFIG[selectedProvider].CLIENT_SECRET,
                code,
                redirect_uri: OAUTH_CONFIG[selectedProvider].REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        let tokenData;
        const contentType = tokenResponse.headers.get('content-type');

        if (contentType?.includes('application/x-www-form-urlencoded')) {
            // URL-encoded 응답 처리
            const text = await tokenResponse.text();
            tokenData = Object.fromEntries(new URLSearchParams(text));
        } else {
            // JSON 응답 처리
            tokenData = await tokenResponse.json();
        }

        // 사용자 정보 요청
        const userInfoResponse = await fetch(OAUTH_ENDPOINTS[selectedProvider].USER_INFO_URL, {
            headers: {
                Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();

        // provider별 고유 식별자 추출
        let providerId;
        switch (selectedProvider) {
            case 'github':
                providerId = String(userInfo.id);
                break;
            case 'google':
                // id_token이 있으면 사용하고, 없으면 userInfo에서 추출
                providerId = tokenData.id_token
                    ? JSON.parse(atob(tokenData.id_token.split('.')[1])).sub
                    : userInfo.sub;
                break;
            case 'kakao':
                providerId = String(userInfo.id);
                break;
            case 'naver':
                providerId = userInfo.response?.id;
                break;
            default:
                throw new Error('Unsupported provider');
        }

        if (!providerId) {
            throw new Error('Failed to extract provider ID');
        }

        // 테스트를 위해 모든 결과 반환
        return NextResponse.json({
            message: 'Callback handled successfully',
            provider: selectedProvider,
            code,
            state,
            tokenData,
            providerId, // 추출된 고유 식별자
            userInfo, // 개발 단계에서 확인을 위해 전체 사용자 정보도 포함
        });
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
