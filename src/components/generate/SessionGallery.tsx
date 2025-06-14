"use client";

import React from 'react';
import ImageItem from './ImageItem';
import type { HistoryItemData } from '@/interfaces/history.interface'; // 타입 경로 확인

interface SessionGalleryProps {
  outputs: HistoryItemData[];
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void; // ✨ onDelete 핸들러를 prop으로 받도록 추가
  className?: string;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ outputs, onImageClick, onDelete, className = '' }) => {
  if (!outputs || outputs.length === 0) return null;

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성된 결과물 갤러리
      </h2>
      <div className="flex space-x-4 pb-4 overflow-x-auto">
        {[...outputs].reverse().map((output) => (
          <div key={output.id} className="flex-shrink-0">
            {/* ✨ ImageItem에 onDelete 핸들러를 그대로 전달합니다. */}
            <ImageItem 
              item={output} 
              onImageClick={onImageClick} 
              onDelete={onDelete} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionGallery;
