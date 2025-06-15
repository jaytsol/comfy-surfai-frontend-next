"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';
import { Clock, Download, FileX, ImageIcon, Maximize, Trash2, Video as VideoIcon } from 'lucide-react';
import type { HistoryItemData } from '@/interfaces/history.interface';
import { storageDuration } from '@/constants/config';

interface HistoryItemProps {
  item: HistoryItemData;
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onImageClick, onDelete }) => {
  // --- 파일 만료 여부 확인 ---
  const isExpired = new Date().getTime() - new Date(item.createdAt).getTime() > storageDuration;
  
  // --- 비디오 관련 정보 계산 ---
  const isVideo = item.mimeType?.startsWith('video/') ?? false;

  // 초 단위를 MM:SS 형식으로 변환하는 헬퍼 함수
  const formatDuration = (seconds: number | undefined): string | null => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // usedParameters에서 비디오 길이를 계산하는 함수
  const calculateDuration = (): string | null => {
    if (!isVideo || !item.usedParameters) return null;
    const length = item.usedParameters.length as number || 0;
    const fps = item.usedParameters.fps as number || 24; // fps 정보가 없을 경우 기본값 24로 가정
    if (length === 0 || fps === 0) return null;
    return formatDuration(length / fps);
  };

  const durationString = calculateDuration();

  // --- 이벤트 핸들러 ---
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 div의 onImageClick 이벤트가 실행되는 것을 방지
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
      {/* 썸네일 표시: 만료, 비디오, 이미지 순으로 분기 처리 */}
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
          // 마우스를 올리면 비디오가 재생되는 효과 (선택 사항)
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
      
      {/* 마우스를 올렸을 때 나타나는 버튼 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center p-4 space-y-2">
        {!isExpired && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onImageClick(item); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
              aria-label="Enlarge Image"
            >
              <Maximize className="w-4 h-4" />
              <span>자세히</span>
            </button>
            <button
              onClick={handleDownloadClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
              aria-label="Download Image"
            >
              <Download className="w-4 h-4" />
              <span>다운로드</span>
            </button>
          </>
        )}
        {/* 삭제 버튼은 파일 만료 여부와 관계없이 표시될 수 있습니다. */}
        <button
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-red-700"
          aria-label="Delete Image"
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
            <p className="text-gray-300 text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
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

export default HistoryItem;
