"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface ResultImageProps {
  outputId: number; // DB에 저장된 결과물의 고유 ID
}

const ResultImage: React.FC<ResultImageProps> = ({ outputId }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      setIsLoading(true);
      try {
        // 백엔드에 이 이미지의 '표시용' URL을 요청합니다.
        const response = await apiClient<{ viewUrl: string }>(`/my-outputs/${outputId}/view-url`);
        setImageUrl(response.viewUrl);
      } catch (error) {
        console.error(`Failed to fetch view URL for output ${outputId}`, error);
        // 오류 발생 시 표시할 대체 이미지나 메시지 설정 가능
        setImageUrl('/path/to/error-image.png'); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [outputId]); // outputId가 변경될 때마다 URL을 다시 가져옵니다.

  // URL을 로딩하는 동안 로딩 스피너 등을 보여줍니다.
  if (isLoading) {
    return (
      <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-gray-500 text-sm">로딩...</span>
      </div>
    );
  }

  // 이미지 렌더링
  return (
    <img
      src={imageUrl || ''}
      alt={`Generated Image ${outputId}`}
      className="w-full h-auto object-cover"
    />
  );
};

export default ResultImage;
