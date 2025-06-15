"use client";

import React from 'react';
import GeneratedItem from "./GeneratedItem"; // GeneratedItem이 같은 common 폴더에 있다고 가정
import type { HistoryItemData } from '@/interfaces/history.interface';
import { History } from 'lucide-react'; // 아이콘 사용 예시

// 이 컴포넌트가 받을 props 타입을 정의합니다.
interface OutputGalleryProps {
  items: HistoryItemData[];
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void;
  layout?: 'grid' | 'scroll'; // ✨ 레이아웃을 선택할 수 있는 prop
  title: string; // 갤러리 제목
  emptyStateMessage?: React.ReactNode; // 비어있을 때 표시할 메시지
  sortOrder?: 'newest-first' | 'default'; // 정렬 순서
  className?: string;
}

const OutputGallery: React.FC<OutputGalleryProps> = ({
  items,
  onImageClick,
  onDelete,
  layout = 'grid', // 기본값은 'grid'
  title,
  emptyStateMessage,
  sortOrder = 'default',
  className = '',
}) => {

  // 표시할 아이템이 없을 경우
  if (!items || items.length === 0) {
    return emptyStateMessage || (
      <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg">
        <History className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">결과물 없음</h3>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          생성된 결과물이 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  // 정렬 순서에 따라 배열 처리
  const displayedItems = sortOrder === 'newest-first' ? [...items].reverse() : items;

  // 레이아웃 렌더링
  const renderLayout = () => {
    if (layout === 'scroll') {
      return (
        <div className="flex space-x-4 pb-4 overflow-x-auto">
          {displayedItems.map((item) => (
            <div key={item.id} className="flex-shrink-0">
              <GeneratedItem 
                item={item} 
                onImageClick={onImageClick} 
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      );
    }

    // 기본값은 grid 레이아웃
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((item) => (
          <GeneratedItem 
            key={item.id} 
            item={item} 
            onImageClick={onImageClick} 
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`mt-2 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="relative">
        {renderLayout()}
      </div>
    </div>
  );
};

export default OutputGallery;
