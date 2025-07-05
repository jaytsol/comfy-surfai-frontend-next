import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientLayout from './client-layout';
import { cookies } from 'next/headers';
import { User } from '@/interfaces/user.interface';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SurfAI',
  description: 'Image Generation Service',
};

// 서버 사이드에서 사용자 정보를 미리 가져오는 함수
async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!accessToken || !apiUrl) {
    return null;
  }

  try {
    // 서버 컴포넌트에서는 브라우저의 fetch가 아닌 Node.js의 fetch를 사용합니다.
    // 따라서, 쿠키를 수동으로 헤더에 담아 보내야 합니다.
    const res = await fetch(`${apiUrl}/auth/profile`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
      },
      cache: 'no-store', // 사용자 정보는 캐시하지 않도록 설정
    });

    if (res.ok) {
      const user = await res.json();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch user on server:', error);
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AuthProvider initialUser={user}>
          <ClientLayout user={user}>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}