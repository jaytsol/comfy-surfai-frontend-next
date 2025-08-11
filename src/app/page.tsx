// app/page.tsx
"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-color">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-color/10 to-secondary-color/10" />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-text-color mb-4">
            SurfAI
          </h1>
          <p className="text-xl text-text-color opacity-80 mb-8">
            AI 이미지 & 비디오 생성 플랫폼
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/surf"
              className="bg-primary-color text-primary-color px-8 py-3 rounded-md text-lg font-medium hover:bg-secondary-color transition duration-200"
            >
              시작
            </Link>
            <Link
              href="/profile"
              className="text-primary-color border-2 border-primary-color px-8 py-3 rounded-md text-lg font-medium hover:bg-primary-color/10 transition duration-200"
            >
              프로필
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text-color text-center mb-12">
            SurfAI로 무엇을 할 수 있을까요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                이미지 생성
              </h3>
              <p className="text-text-color opacity-80">
                고급 AI 기술을 사용하여 텍스트 프롬프트로 멋진 이미지를 만들어 보세요
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                비디오 제작
              </h3>
              <p className="text-text-color opacity-80">
                AI 기반 애니메이션과 편집 기술로 놀라운 비디오를 생성하세요
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg shadow-sm">
              <div className="text-4xl text-primary-color mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-text-color mb-2">
                빠르고 쉬운 사용법
              </h3>
              <p className="text-text-color opacity-80">
                간단한 인터페이스와 빠른 생성 시간으로 누구나 쉽게 만들 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-color/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <div className="text-3xl font-bold text-text-color">
              창작할 준비가 되셨나요?
            </div>
            <div className="text-xl text-text-color opacity-80">
              SurfAI와 함께 아이디어를 현실로 만드는 수많은 크리에이터와 함께하세요
            </div>
            <div className="mt-8">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-10 py-4 text-2xl font-bold text-text-color bg-primary-color rounded-xl shadow-lg hover:bg-secondary-color transition-all duration-300 transform hover:scale-105"
              >
                지금 바로 시작하세요
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}