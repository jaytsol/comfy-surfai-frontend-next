"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';
import { Clock, Download, FileX, ImageIcon, Maximize, Trash2, Video as VideoIcon } from 'lucide-react';
import type { HistoryItemData } from '@/interfaces/history.interface'; // 타입은 히스토리 기준으로 통일
import { storageDuration } from '@/constants/config'; // storageDuration을 중앙에서 관리

// 이 컴포넌트가 받을 props 타입 정의
interface GeneratedItemProps {
  item: HistoryItemData;
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void;
}

const GeneratedItem: React.FC<GeneratedItemProps> = ({ item, onImageClick, onDelete }) => {
  // --- 파일 만료 여부 확인 ---
  const isExpired = new Date().getTime() - new Date(item.createdAt).getTime() > storageDuration;
  
  // --- 비디오 관련 정보 계산 ---
  const isVideo = item.mimeType?.startsWith('video/') ?? false;

  const formatDuration = (seconds?: number): string | null => {
    if (seconds === undefined || isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calculateDuration = (): string | null => {
    if (!isVideo || !item.usedParameters) return null;
    const length = item.usedParameters.length as number || 0;
    const fps = item.usedParameters.fps as number || 24;
    if (length === 0 || fps === 0) return null;
    return formatDuration(length / fps);
  };
  const durationString = calculateDuration();

  // --- 이벤트 핸들러 ---
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiClient<{ downloadUrl: string }>(`/my-outputs/${item.id}/download-url`);
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`다운로드 URL 생성에 실패했습니다 (ID: ${item.id}):`, error);
      alert("파일을 다운로드하는 중 오류가 발생했습니다. 파일이 만료되었을 수 있습니다.");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <div
      onClick={!isExpired ? () => onImageClick(item) : undefined}
      className={`flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-md overflow-hidden bg-gray-200 text-white ${!isExpired ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* 썸네일 표시 */}
      {isExpired ? (
        <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center p-4 text-center">
          <FileX className="w-12 h-12 text-gray-500" />
          <p className="text-sm text-gray-400 mt-2">파일 기간 만료</p>
        </div>
      ) : isVideo ? (
        <video
          src={item.viewUrl}
          className="w-full h-full object-cover"
          muted
          playsInline
          loop
          onMouseOver={e => e.currentTarget.play().catch(() => {})}
          onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
        />
      ) : (
        <img
          src={item.viewUrl}
          alt={item.originalFilename}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* 마우스오버 UI */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center p-4 space-y-2">
        {!isExpired && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onImageClick(item); }}
              className="opacity-0 group-hover:opacity-100 ... (스타일)"
              aria-label="Enlarge"
            >
              <Maximize className="w-4 h-4" />
              <span>자세히 보기</span>
            </button>
            <button
              onClick={handleDownloadClick}
              className="opacity-0 group-hover:opacity-100 ... (스타일)"
              aria-label="Download"
            >
              <Download className="w-4 h-4" />
              <span>다운로드</span>
            </button>
          </>
        )}
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 ... (스타일)"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
          <span>삭제</span>
        </button>
      </div>

       {/* 하단 정보 표시 */}
       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
          <div className="flex items-center gap-2">
             {isVideo ? <VideoIcon className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
             <p className="text-white text-xs font-medium truncate" title={item.originalFilename}>
               {item.originalFilename}
             </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-300 text-xs">{new Date(item.createdAt).toLocaleString()}</p>
            {durationString && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/50 rounded-full">
                <Clock className="w-2.5 h-2.5 text-white" />
                <p className="text-white text-xs font-mono">{durationString}</p>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default GeneratedItem;
