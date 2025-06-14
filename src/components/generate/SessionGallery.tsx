"use client";

import React from 'react';
import ImageItem from './ImageItem';
import { HistoryItemData } from '@/interfaces/history.interface';
interface SessionGalleryProps {
  outputs: HistoryItemData[];
  handleImageClick: (outputId: number) => void; // ✨ 이미지 클릭 핸들러를 prop으로 받음
  className?: string;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ outputs, handleImageClick, className = '' }) => {
  if (!outputs || outputs.length === 0) return null;

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성된 결과물 갤러리
      </h2>
      <div className="flex space-x-4 pb-4 overflow-x-auto">
        {[...outputs].reverse().map((output) => (
          <div key={output.id} className="flex-shrink-0 relative group w-64 h-64 ...">
            {/* ✨ onImageClick 핸들러를 그대로 자식에게 전달 */}
            <ImageItem output={output} onImageClick={handleImageClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionGallery;
