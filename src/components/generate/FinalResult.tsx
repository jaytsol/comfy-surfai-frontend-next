"use client";

import React from 'react';
import apiClient from '@/lib/apiClient'; // apiClient 임포트
import type { ImageGenerationData } from '@/interfaces/websocket.interface';
import ResultImage from './ResultImage';

interface FinalResultProps {
  result: (ImageGenerationData & { type: 'final' }) | null;
  className?: string;
}

const FinalResult: React.FC<FinalResultProps> = ({ result, className = '' }) => {
  if (!result || !result.outputs || result.outputs.length === 0) {
    return null;
  }

  // 다운로드 버튼 클릭 핸들러
  const handleDownloadClick = async (outputId: number) => {
    try {
      // 1. 백엔드에 미리 서명된 다운로드 URL 요청
      const response = await apiClient<{ downloadUrl: string }>(`/my-outputs/${outputId}/download-url`);
      const signedUrl = response.downloadUrl;

      // 2. 백엔드로부터 받은 URL로 다운로드 시작
      const link = document.createElement('a');
      link.href = signedUrl;
      // 'download' 속성은 서버의 Content-Disposition 헤더에 의해 결정되므로 여기서 필요 없습니다.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to get download URL:", error);
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성 완료! 🎉
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {result.outputs.map((output) => (
          // ✨ --- 각 결과물에 대해 ResultImage 컴포넌트 렌더링 --- ✨
          <div key={output.id} className="group relative rounded-lg overflow-hidden shadow-lg">
            <ResultImage outputId={output.id} />

            {/* 다운로드 버튼 오버레이 */}
            <div 
              onClick={() => handleDownloadClick(output.id)}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              <span className="opacity-0 group-hover:opacity-100 ...">
                다운로드
              </span>
            </div>
          </div>
        ))}
      </div>
      {result.prompt_id && <p className="mt-2 text-xs text-gray-500">Prompt ID: {result.prompt_id}</p>}
    </div>
  );
};

export default FinalResult;
