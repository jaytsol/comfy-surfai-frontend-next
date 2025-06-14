"use client";

import React from 'react';
import HistoryItem from './HistoryItem';
import type { HistoryItemData } from '@/interfaces/history.interface';

interface HistoryGalleryProps {
  items: HistoryItemData[];
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void;
  className?: string;
}

const HistoryGallery: React.FC<HistoryGalleryProps> = ({ items, onImageClick, onDelete, className = '' }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>생성된 기록이 없습니다.</p>
        <p className="text-sm mt-2">Generate 페이지에서 새로운 이미지를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {items.map((item) => (
        <HistoryItem 
          key={item.id} 
          item={item} 
          onImageClick={onImageClick} 
          onDelete={(id, e) => { e.stopPropagation(); onDelete(id); }}
        />
      ))}
    </div>
  );
};

export default HistoryGallery;
