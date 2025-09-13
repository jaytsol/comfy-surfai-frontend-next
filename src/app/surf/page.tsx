'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ImageIcon, MessageSquareText, FileText } from 'lucide-react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, href }) => (
  <Link href={href} className="block">
    <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow duration-300 h-full">
      <CardHeader className="pb-4">
        <div className="text-4xl text-primary mb-2">{icon}</div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground flex-grow">
        <p>{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function SurfPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-center mb-10">SurfAI 기능 탐색</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<ImageIcon size={48} />}
          title="이미지 생성"
          description="고급 AI 모델을 사용하여 텍스트 프롬프트로 멋진 이미지를 생성하세요."
          href="/surf/generate"
        />
        <FeatureCard
          icon={<MessageSquareText size={48} />}
          title="AI 채팅"
          description="AI와 지능적인 대화를 나누고 창의적인 텍스트 응답을 받아보세요."
          href="/surf/chat"
        />
        <FeatureCard
          icon={<FileText size={48} />} // New icon for RAG
          title="문서 Q&A (RAG)"
          description="문서를 업로드하고 질문하여 즉각적이고 맥락을 인지하는 답변을 얻으세요."
          href="/surf/rag" // Link to the new RAG page
        />
        {/* Add more FeatureCards as new features are developed */}
      </div>
    </div>
  );
}
