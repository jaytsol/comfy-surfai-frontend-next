"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface ImageLightboxProps {
  // 이제 이미지 URL 대신 outputId를 받습니다. null이면 라이트박스를 숨깁니다.
  outputId: number | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ outputId, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // outputId prop이 변경될 때마다 새로운 URL을 가져옵니다.
  useEffect(() => {
    if (outputId === null) {
      setImageUrl(null); // ID가 null이면 이미지 URL도 초기화
      return;
    }

    const fetchUrl = async () => {
      setIsLoading(true);
      try {
        // 백엔드의 "표시용 URL 생성" API 호출
        const response = await apiClient<{ viewUrl: string }>(`/my-outputs/${outputId}/view-url`);
        setImageUrl(response.viewUrl);
      } catch (error) {
        console.error(`Failed to fetch enlarged view URL for output ${outputId}`, error);
        setImageUrl('/error-placeholder.png'); // 에러 이미지 표시
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [outputId]);


  if (outputId === null) {
    return null;
  }

  // 뒷 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <button onClick={onClose} className="absolute top-4 right-5 text-white text-4xl ...">&times;</button>
      
      <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
        {isLoading && <span className="text-white">이미지 로딩 중...</span>}
        {!isLoading && imageUrl && (
          <img
            src={imageUrl}
            alt={`Enlarged view for output ${outputId}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
