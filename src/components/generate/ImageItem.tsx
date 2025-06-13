"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface ImageItemProps {
  output: { id: number };
  onImageClick: (outputId: number) => void; // 확대할 URL을 부모에게 전달
}

const ImageItem: React.FC<ImageItemProps> = ({ output, onImageClick }) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null); // 썸네일 표시용 URL
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 표시용 URL을 한 번만 가져옵니다.
  useEffect(() => {
    const fetchViewUrl = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient<{ viewUrl: string }>(`/my-outputs/${output.id}/view-url`);
        setViewUrl(response.viewUrl);
      } catch (error) {
        console.error(`Failed to fetch view URL for output ${output.id}`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchViewUrl();
  }, [output.id]);

  // 다운로드 버튼 클릭 핸들러
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 이미지 확대 클릭이 실행되는 것을 막음
    try {
      const response = await apiClient<{ downloadUrl: string }>(`/my-outputs/${output.id}/download-url`);
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />;
  }

  return (
    <div onClick={() => onImageClick(output.id)} className="w-full h-full cursor-pointer">
      <img
        src={viewUrl || ''} // ✨ 받아온 viewUrl로 이미지 표시
        alt={`Generated image ${output.id}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
        <button
          onClick={handleDownloadClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-black rounded-md text-sm font-semibold"
        >
          다운로드
        </button>
      </div>
    </div>
  );
};

export default ImageItem;