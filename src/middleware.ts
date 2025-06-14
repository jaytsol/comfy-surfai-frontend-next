import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 로그아웃 상태에서도 접근 가능한 경로 목록
const PUBLIC_PATHS = ['/', '/documents', '/login', '/register', '/api/auth/callback', '/api/auth/signout']; // '/api/auth/...' 등 인증 관련 API 경로도 필요시 추가

// 인증이 필요한 경로의 기본 접두사 (이 외 모든 경로는 기본적으로 보호)
// 혹은 명시적으로 보호할 경로 목록을 만들 수도 있습니다.
// const PROTECTED_PATH_PREFIXES = ['/profile', '/generate', '/settings', '/team', '/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 인증 토큰 확인 (실제 사용하는 쿠키 이름으로 변경해야 합니다)
  // 예: 'auth-token', 'next-auth.session-token', 'supabase-auth-token' 등
  const authToken = request.cookies.get('connect.sid')?.value; // 실제 사용하는 쿠키 이름으로 변경해주세요.

  // 2. Next.js 내부 경로, API 라우트 (일부 공개 API 제외), 정적 파일 등은 미들웨어 로직에서 제외
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/public/') // 공개 API가 있다면 '/api/public/' 등으로 구분
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || (path.endsWith('/*') && pathname.startsWith(path.slice(0, -2))));


  // 3. 사용자가 인증되지 않았고, 접근하려는 경로가 공개 경로가 아닌 경우
  if (!authToken && !isPublicPath) {
    // 로그인 페이지로 리디렉션. 원래 요청했던 경로를 쿼리 파라미터로 전달하여 로그인 후 해당 경로로 이동시킬 수 있습니다.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. 사용자가 인증되었고, 로그인 페이지나 회원가입 페이지에 접근하려는 경우 (선택 사항)
  // if (authToken && (pathname === '/login' || pathname === '/signup')) {
  //   return NextResponse.redirect(new URL('/', request.url)); // 홈으로 리디렉션
  // }

  // TODO: 향후 역할 기반 접근 제어 (예: admin, user) 로직 추가 위치
  // if (authToken && pathname.startsWith('/admin') && !userHasAdminRole(authToken)) { // userHasAdminRole은 토큰에서 역할 정보를 파싱하는 함수
  //   return NextResponse.redirect(new URL('/unauthorized', request.url));
  // }


  return NextResponse.next();
}

// 미들웨어가 실행될 경로를 지정합니다.
// matcher를 사용하면 위에서 /_next/ 등을 제외하는 로직을 더 깔끔하게 관리할 수 있습니다.
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
