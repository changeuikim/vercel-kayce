import { NextResponse } from "next/server";
import { stateManager } from "@/lib/auth/common/cookieUtils";
import { AuthProvider } from "@/lib/auth/social/constants";

export async function GET(
  req: Request,
  { params }: { params: { provider: string } },
) {
  const { provider } = params;

  if (!(provider in AuthProvider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  // State 검증
  const isValidState = await stateManager.validateState(state, provider);
  if (!isValidState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  // TODO: Access Token 교환 로직 추가

  return NextResponse.json({
    message: "Callback handled successfully",
    provider,
    code,
    state,
  });
}
