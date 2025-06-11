"use client";

import React from 'react';

// 컴포넌트가 받을 props 타입을 정의합니다.
interface FinalResultProps {
  // `useComfyWebSocket` 훅에서 관리하는 최종 결과 데이터
  result: {
    prompt_id?: string;
    image_urls?: string[];
  } | null;
  className?: string;
}

const FinalResult: React.FC<FinalResultProps> = ({ result, className = '' }) => {
  // 결과 데이터가 없거나, 이미지 URL 배열이 없으면 아무것도 렌더링하지 않습니다.
  if (!result || !result.image_urls || result.image_urls.length === 0) {
    return null;
  }

  // 다운로드 버튼 클릭 핸들러
  const handleDownload = (url: string) => {
    // 새 탭에서 이미지를 열어 사용자가 직접 저장하도록 하거나,
    // a 태그의 download 속성을 이용하여 직접 다운로드를 트리거할 수 있습니다.
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // 새 탭에서 열기
    link.download = url.substring(url.lastIndexOf('/') + 1); // URL에서 파일명 추출
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        생성 완료! 🎉
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {result.image_urls.map((url, index) => (
          <div key={index} className="group relative rounded-lg overflow-hidden shadow-lg">
            <img
              src={url}
              alt={`Generated Image ${index + 1}`}
              className="w-full h-auto object-cover"
            />
            {/* 마우스를 올리면 다운로드 버튼 표시 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => handleDownload(url)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 bg-white text-black rounded-md text-sm font-semibold"
              >
                다운로드
              </button>
            </div>
          </div>
        ))}
      </div>
      {result.prompt_id && <p className="mt-2 text-xs text-gray-500">Prompt ID: {result.prompt_id}</p>}
    </div>
  );
};

export default FinalResult;
