"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';

interface GenerationOutput {
  id: number;
  r2Url: string;
}

interface SessionGalleryProps {
  outputs: GenerationOutput[];
  onImageClick: (imageUrl: string) => void; // ✨ 이미지 클릭 핸들러를 prop으로 받음
  className?: string;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ outputs, onImageClick, className = '' }) => {
  if (!outputs || outputs.length === 0) {
    return null;
  }

  const handleDownloadClick = async (e: React.MouseEvent, outputId: number) => {
    e.stopPropagation(); // ✨ 중요: 이 버튼 클릭이 부모 div의 onImageClick을 트리거하지 않도록 막습니다.
    try {
      const response = await apiClient<{ downloadUrl: string }>(`/my-outputs/${outputId}/download-url`);
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("다운로드 URL 생성에 실패했습니다:", error);
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성된 결과물 갤러리
      </h2>
      <div className="relative">
        <div 
          className="flex space-x-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #E5E7EB' }}
        >
          {[...outputs].reverse().map((output) => (
            <div 
              key={output.id} 
              // ✨ 이미지 카드 전체에 클릭 핸들러 추가
              onClick={() => onImageClick(output.r2Url)} 
              className="flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-lg overflow-hidden bg-gray-100 cursor-pointer"
            >
              <img
                src={output.r2Url}
                alt={`Generated image ${output.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                <button
                  // ✨ 다운로드 버튼의 onClick 핸들러 수정
                  onClick={(e) => handleDownloadClick(e, output.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-black rounded-md text-sm font-semibold"
                >
                  다운로드
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionGallery;
