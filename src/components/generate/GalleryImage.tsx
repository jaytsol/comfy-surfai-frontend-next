"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface GalleryImageProps {
  output: {
    id: number;
    // r2Url은 더 이상 직접 사용하지 않지만, alt 태그 등에 활용 가능
    originalFilename?: string; 
  };
}

const GalleryImage: React.FC<GalleryImageProps> = ({ output }) => {
  // 컴포넌트 내부에서 사용할 상태: 로딩 상태와 최종 이미지 URL
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 이 컴포넌트가 렌더링될 때 한 번만 실행됩니다.
  useEffect(() => {
    const fetchViewUrl = async () => {
      setIsLoading(true);
      try {
        // 백엔드의 "표시용 URL 생성" API를 호출합니다.
        const response = await apiClient<{ viewUrl: string }>(`/my-outputs/${output.id}/view-url`);
        setImageUrl(response.viewUrl);
      } catch (error) {
        console.error(`Failed to fetch view URL for output ${output.id}:`, error);
        // 오류 발생 시 대체 이미지 경로 설정
        setImageUrl('/error-placeholder.png'); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchViewUrl();
  }, [output.id]); // output.id가 바뀔 때마다 URL을 다시 가져옵니다.

  // 다운로드 버튼 클릭 핸들러
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이미지 클릭 이벤트와 분리
    try {
      const response = await apiClient<{ downloadUrl: string }>(`/my-outputs/${output.id}/download-url`);
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

  // URL을 로딩하는 동안 로딩 스피너(또는 플레이스홀더)를 보여줍니다.
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-gray-500 text-sm">...</span>
      </div>
    );
  }

  return (
    <>
      <img
        src={imageUrl || ''} // 백엔드로부터 받은 미리 서명된 URL 사용
        alt={`Generated image ${output.id}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center"
      >
        <button
          onClick={handleDownloadClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-black rounded-md text-sm font-semibold"
        >
          다운로드
        </button>
      </div>
    </>
  );
};

export default GalleryImage;
