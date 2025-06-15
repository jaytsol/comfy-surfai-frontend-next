"use client";

import React from 'react';
import type { HistoryItemData } from '@/interfaces/history.interface';
import { ScrollArea } from '@/components/ui/scroll-area'; // shadcn/ui의 ScrollArea 사용 예시

// Props 타입: 이제 URL을 직접 받습니다.
interface ImageLightboxProps {
  item: HistoryItemData | null;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ item, onClose }) => {
  // ✨ useEffect와 상태 관리 로직을 모두 제거합니다.

  // imageUrl이 없으면 아무것도 렌더링하지 않습니다.
  if (!item) {
    return null;
  }

  const isVideo = item.mimeType?.startsWith('video/') ?? false;

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
      <button onClick={onClose} className="absolute top-4 right-5 text-white text-4xl font-bold ...">&times;</button>
      
      {/* ✨ --- 라이트박스 레이아웃을 이미지와 정보 패널로 분리 --- ✨ */}
      <div onClick={handleBackdropClick} className="flex flex-col md:flex-row gap-4 max-w-6xl w-full max-h-[90vh]">
        
        {/* 1. 이미지 표시 영역 */}
        <div className="flex-grow flex items-center justify-center">
          {isVideo ? (
            // ✨ 비디오일 경우, controls를 활성화하여 재생/정지 가능하게 함
            <video
              src={item.viewUrl}
              controls
              autoPlay
              loop
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <img
              src={item.viewUrl}
              alt={`Enlarged view for output ${item.id}`}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* 2. 메타데이터 표시 영역 */}
        <div className="md:max-w-sm w-full bg-gray-800 bg-opacity-80 text-white p-4 rounded-lg flex-shrink-0">
          <h3 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-3">생성 정보</h3>
          <ScrollArea className="h-[75vh] pr-3"> {/* 내용이 길어질 경우 스크롤 */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-400">ID</p>
                <p>{item.id}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-400">생성일</p>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {item.usedParameters && Object.entries(item.usedParameters).length > 0 && (
                <div>
                  <p className="font-semibold text-gray-400">사용된 파라미터</p>
                  <div className="mt-1 space-y-2 text-xs bg-black/20 p-3 rounded">
                    {Object.entries(item.usedParameters).map(([key, value]) => (
                      <div key={key}>
                        <p className="font-medium text-gray-300 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-gray-100 break-all">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ImageLightbox;
