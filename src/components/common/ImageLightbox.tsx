"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface ImageLightboxProps {
  outputId: number | null; // ✨ URL 대신 ID를 받습니다.
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ outputId, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (outputId === null) return;

    const fetchUrl = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient<{ viewUrl: string }>(`/my-outputs/${outputId}/view-url`);
        setImageUrl(response.viewUrl);
      } catch (error) {
        console.error(`Failed to fetch view URL for output ${outputId}`, error);
        setImageUrl(null); // 에러 시 URL 초기화
      } finally {
        setIsLoading(false);
      }
    };
    fetchUrl();
  }, [outputId]);

  if (outputId === null) return null;

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
