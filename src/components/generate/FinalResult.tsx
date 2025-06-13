"use client";

import React from 'react';
import apiClient from '@/lib/apiClient'; // apiClient 임포트
import type { ImageGenerationData } from '@/interfaces/websocket.interface';

interface FinalResultProps {
  result: (ImageGenerationData & { type: 'final' }) | null;
  className?: string;
}

const FinalResult: React.FC<FinalResultProps> = ({ result, className = '' }) => {
  if (!result || !result.image_urls || result.image_urls.length === 0) {
    return null;
  }

  // 다운로드 버튼 클릭 핸들러
  const handleDownloadClick = async (imageUrl: string) => {
    // 주의: 이 로직은 DB에 저장된 GeneratedOutput ID가 필요합니다.
    // 현재 result 객체에는 ID가 없으므로, 임시로 파일명에서 로직을 구성하거나
    // 백엔드 응답에 output ID를 포함시켜야 합니다.
    // 여기서는 개념 설명을 위해 가상의 outputId를 사용합니다.
    // TODO: 백엔드의 'generation_result' WebSocket 메시지에 각 URL에 해당하는 DB ID를 포함시켜야 합니다.
    const pseudoOutputId = 1; // <<-- 이 부분은 실제 DB ID로 대체되어야 합니다.

    try {
      // 1. 백엔드에 미리 서명된 다운로드 URL 요청
      const response = await apiClient<{ downloadUrl: string }>(`/my-history/my-outputs/${pseudoOutputId}/download-url`);
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
        {result.image_urls.map((url, index) => (
          <div key={url} className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer">
            <img
              src={url}
              alt={`Generated Image ${index + 1}`}
              className="w-full h-auto object-cover"
            />
            <div 
              onClick={() => handleDownloadClick(url)} // 이미지 클릭 시 다운로드
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-black rounded-md text-sm font-semibold">
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
