"use client";

import React from 'react';

// Props 타입: 이제 URL을 직접 받습니다.
interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  // ✨ useEffect와 상태 관리 로직을 모두 제거합니다.

  // imageUrl이 없으면 아무것도 렌더링하지 않습니다.
  if (!imageUrl) {
    return null;
  }

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
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-white text-4xl font-bold hover:text-gray-300"
        aria-label="Close"
      >
        &times;
      </button>
      <div className="relative max-w-4xl max-h-[90vh]">
        {/* ✨ prop으로 받은 imageUrl을 직접 사용합니다. */}
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
