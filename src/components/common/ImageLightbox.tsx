"use client";

import React from 'react';

interface ImageLightboxProps {
  // 확대해서 보여줄 이미지의 URL. null이면 라이트박스를 숨깁니다.
  imageUrl: string | null;
  // 라이트박스를 닫는 함수
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  // imageUrl이 없으면 아무것도 렌더링하지 않습니다.
  if (!imageUrl) {
    return null;
  }

  // 뒷 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 이미지 자체를 클릭했을 때는 닫히지 않도록 합니다.
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // 반투명 배경 (Backdrop)
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* 닫기 버튼 (X) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-white text-4xl font-bold hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        &times;
      </button>

      {/* 이미지 컨테이너 */}
      <div className="relative max-w-4xl max-h-[90vh]">
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
