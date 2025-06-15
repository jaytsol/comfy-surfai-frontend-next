"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';
import { Download, Maximize, Trash2 } from 'lucide-react';
import type { HistoryItemData } from '@/interfaces/history.interface';
import { Video as VideoIcon, ImageIcon } from 'lucide-react';

interface ImageItemProps {
  item: HistoryItemData;
  onImageClick: (item: HistoryItemData) => void;
  onDelete: (id: number) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ item, onImageClick, onDelete }) => {
  
  // 다운로드 버튼 클릭 핸들러
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
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const isVideo = item.mimeType?.startsWith('video/') ?? false;
  
  return (
    <div
      onClick={() => onImageClick(item)}
      className="flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-md overflow-hidden bg-gray-900 text-white"
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
      
      {/* 마우스를 올렸을 때 나타나는 반투명 오버레이와 버튼들 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center p-4 space-y-2"
      >
        {/* 확대보기 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onImageClick(item); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
          aria-label="Enlarge Image"
        >
          <Maximize className="w-4 h-4" />
          <span>확대보기</span>
        </button>

        {/* 다운로드 버튼 */}
        <button
          onClick={handleDownloadClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-4 py-2 bg-white/90 text-black rounded-md text-sm font-semibold backdrop-blur-sm hover:bg-white"
          aria-label="Download Image"
        >
          <Download className="w-4 h-4" />
          <span>다운로드</span>
        </button>
        
        {/* 삭제 버튼 */}
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
             {/* ✨ 파일 타입에 따라 아이콘 표시 */}
             {isVideo ? <VideoIcon className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
             <p className="text-white text-xs font-medium truncate" title={item.originalFilename}>
               {item.originalFilename}
             </p>
          </div>
          <p className="text-gray-300 text-xs mt-1">{new Date(item.createdAt).toLocaleString()}</p>
       </div>
    </div>
  );
};

export default ImageItem;
