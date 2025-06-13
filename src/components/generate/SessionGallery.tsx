"use client";

import React from 'react';
import GalleryImage from './GalleryImage'; // ✨ 새로 만든 GalleryImage 컴포넌트 임포트

// props 타입은 이제 id만 있으면 충분합니다.
interface GenerationOutput {
  id: number;
}

interface SessionGalleryProps {
  outputs: GenerationOutput[];
  className?: string;
}

const SessionGallery: React.FC<SessionGalleryProps> = ({ outputs, className = '' }) => {
  if (!outputs || outputs.length === 0) {
    return null;
  }

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성된 결과물 갤러리
      </h2>
      <div className="relative">
        <div 
          className="flex space-x-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#A5B4FC #E0E7FF' }}
        >
          {[...outputs].reverse().map((output) => (
            <div 
              key={output.id} 
              className="flex-shrink-0 relative group w-64 h-64 rounded-lg shadow-lg overflow-hidden bg-gray-100"
            >
              {/* ✨ 이제 각 이미지는 GalleryImage 컴포넌트가 알아서 처리합니다. */}
              <GalleryImage output={output} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionGallery;
