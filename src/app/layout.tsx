// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // src/app/globals.css 또는 app/globals.css
import { AuthProvider } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SurfAI',
  description: 'Image Generation Service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider> {/* AuthProvider로 전체 앱 감싸기 */}
          <Navbar />     {/* 모든 페이지에 표시될 네비게이션 바 */}
          <main>{children}</main> {/* 페이지 컨텐츠가 여기에 렌더링됨 */}
        </AuthProvider>
      </body>
    </html>
  );
}