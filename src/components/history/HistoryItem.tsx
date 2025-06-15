"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';
import { Clock, Download, ImageIcon, Maximize, Trash2, VideoIcon } from 'lucide-react';
import { HistoryItemData } from '@/interfaces/history.interface';

interface HistoryItemProps {
  item: HistoryItemData;
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onImageClick, onDelete }) => {
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
      console.error("다운로드 URL 생성에 실패했습니다:", error);
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  const isVideo = item.mimeType?.startsWith('video/') ?? false;

  // ✨ --- 비디오 길이 계산 및 포맷팅 로직 --- ✨
  const calculateDuration = (): string | null => {
    // 1. 비디오가 아니거나, 파라미터 정보가 없으면 null 반환
    if (!isVideo || !item.usedParameters) return null;

    // 2. length와 fps 값을 가져옵니다. (기본값 설정)
    const length = item.usedParameters.length as number || 0;
    const fps = item.usedParameters.fps as number || 24; // fps 정보가 없을 경우 기본값 24로 가정

    if (length === 0 || fps === 0) return null;

    // 3. 초 단위로 길이를 계산합니다.
    const durationInSeconds = length / fps;

    // 4. MM:SS 형식으로 변환합니다.
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const durationString = calculateDuration();

  return (
    <div 
      className="flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-md overflow-hidden bg-gray-100 cursor-pointer"
      onClick={() => onImageClick(item)}
    >
      {isVideo ? (
        // ✨ 비디오일 경우 <video> 태그를 사용하여 썸네일(첫 프레임)을 표시
        <video
          src={item.viewUrl}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
      ) : (
        // 이미지는 기존과 동일
        <img
          src={item.viewUrl}
          alt={item.originalFilename}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center p-4 space-y-2">
        <button
          onClick={(e) => { e.stopPropagation(); onImageClick(item); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/80 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
          aria-label="Enlarge Image"
        >
          <Maximize className="w-4 h-4" />
          <span>확대보기</span>
        </button>
        <button
          onClick={handleDownloadClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/80 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
          aria-label="Download Image"
        >
          <Download className="w-4 h-4" />
          <span>다운로드</span>
        </button>
        <button
          onClick={(e) => onDelete(item.id, e)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-red-600"
          aria-label="Delete Image"
        >
          <Trash2 className="w-4 h-4" />
          <span>삭제</span>
        </button>
      </div>
       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
          <div className="flex items-center gap-2">
            {isVideo ? <VideoIcon className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
            <p className="text-white text-xs font-medium truncate" title={item.originalFilename}>{item.originalFilename}</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-300 text-xs">{new Date(item.createdAt).toLocaleDateString()}</p>
            {/* ✨ 계산된 비디오 길이(durationString)를 표시합니다. */}
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
