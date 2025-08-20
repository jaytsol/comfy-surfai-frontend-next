import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 로그인하지 않아도 접근할 수 있는 공개 경로 목록
// '/auth/callback'은 Google 로그인 후 토큰을 받기 위해 반드시 포함되어야 합니다.
const PUBLIC_PATHS = ['/', '/login', '/register', '/auth/callback', '/documents', '/privacy-policy']; 

// API 라우트는 별도로 처리되므로, matcher에서 제외하여 미들웨어가 실행되지 않도록 합니다.
// API의 각 엔드포인트는 백엔드의 'JwtAuthGuard'가 보호합니다.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 요청에서 'surfai_access_token' 쿠키를 확인합니다.
  // 이 쿠키는 로그인 상태를 빠르게 확인하기 위한 '힌트' 역할을 합니다.
  // 실제 인증은 각 페이지나 API 요청 시 백엔드를 통해 이루어집니다.
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // 2. 사용자가 로그인하지 않았고 (토큰 없음), 접근하려는 경로가 보호된 경로일 경우
  if (!accessToken && !refreshToken && !isPublicPath) {
    // 로그인 페이지로 리디렉션합니다.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. 사용자가 로그인했고 (토큰 있음), 로그인/회원가입 페이지에 접근하려는 경우
  if (accessToken && (pathname === '/login' || pathname === '/register')) {
    const redirectTo = request.nextUrl.searchParams.get('redirect_to');
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    // 대시보드나 히스토리 페이지 등 기본 페이지로 리디렉션합니다.
    return NextResponse.redirect(new URL('/history', request.url));
  }

  // 그 외의 경우는 모두 허용
  return NextResponse.next();
}

// 미들웨어가 실행될 경로를 지정합니다.
export const config = {
  matcher: [
    /*
     * 다음으로 시작하는 경로를 제외한 모든 요청 경로와 일치합니다:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
