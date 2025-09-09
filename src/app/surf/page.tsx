
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { ChatModal } from '@/components/common/ChatModal';

export default function SurfPage() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/surf/generate" passHref>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>이미지 & 비디오 생성</span>
                <ArrowRight className="w-5 h-5" />
              </CardTitle>
              <CardDescription>
                AI 이미지 혹은 비디오 등을 생성할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* You can add more content here if needed */}
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsChatModalOpen(true)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI 채팅</span>
              <MessageCircle className="w-5 h-5" />
            </CardTitle>
            <CardDescription>
              AI와 대화하며 궁금한 것을 물어보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* You can add more content here if needed */}
          </CardContent>
        </Card>
      </div>

      <ChatModal isOpen={isChatModalOpen} onOpenChange={setIsChatModalOpen} />
    </>
  );
}
