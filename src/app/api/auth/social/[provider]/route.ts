import { NextResponse } from 'next/server';
import { stateManager } from '@/lib/auth/common/cookieUtils';
import {
    OAUTH_CONFIG,
    OAUTH_ENDPOINTS,
    OAUTH_SCOPES,
    AuthProvider,
} from '@/lib/auth/social/constants';

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;

    // provider가 유효한지 검증
    if (!(provider in AuthProvider)) {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const selectedProvider = provider as AuthProvider;

    // 안전한 state 생성 및 저장
    const state = stateManager.generateState();
    await stateManager.saveState(state, selectedProvider);

    // 인증 URL 생성
    const authUrl =
        `${OAUTH_ENDPOINTS[selectedProvider].AUTH_URL}?` +
        new URLSearchParams({
            client_id: OAUTH_CONFIG[selectedProvider].CLIENT_ID,
            redirect_uri: OAUTH_CONFIG[selectedProvider].REDIRECT_URI,
            scope: OAUTH_SCOPES[selectedProvider].join(' '),
            state: state, // 생성된 state 사용
            response_type: 'code', // 명시적으로 설정
        });

    return NextResponse.redirect(authUrl);
}
