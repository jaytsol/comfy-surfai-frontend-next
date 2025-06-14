"use client";

import React from 'react';
import apiClient from '@/lib/apiClient';
import { Download, Maximize, Trash2 } from 'lucide-react';
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

  return (
    <div 
      className="flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-md overflow-hidden bg-gray-100 cursor-pointer"
      onClick={() => onImageClick(item)}
    >
      <img
        src={item.viewUrl}
        alt={`Generated image ${item.id}`}
        className="w-full h-full object-cover"
      />
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
          <p className="text-white text-xs font-medium truncate" title={item.originalFilename}>{item.originalFilename}</p>
          <p className="text-gray-300 text-xs">{new Date(item.createdAt).toLocaleString()}</p>
       </div>
    </div>
  );
};

export default HistoryItem;
