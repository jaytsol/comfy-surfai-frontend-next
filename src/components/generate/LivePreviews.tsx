import React from 'react';

interface LivePreviewsProps {
  previews: { url: string; promptId: string }[];
  className?: string;
}

const LivePreviews: React.FC<LivePreviewsProps> = ({
  previews,
  className = '',
}) => {
  if (previews.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-700">실시간 프리뷰</h3>
        {previews.length > 0 && (
          <span className="text-sm text-gray-500">{previews.length}개의 이미지</span>
        )}
      </div>
      
      <div className="relative">
        <div 
          className="flex space-x-4 pb-4 overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB',
          }}
        >
          {previews.length > 0 ? (
            [...previews].reverse().map((preview, index) => (
              <div 
                key={`${preview.promptId}-${index}`} 
                className="flex-shrink-0 relative group w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-lg shadow-md overflow-hidden bg-gray-100"
              >
                <img
                  src={preview.url}
                  alt={`Live preview ${index + 1} for prompt ${preview.promptId}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onClick={() => window.open(preview.url, '_blank')}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">
                    Prompt: {preview.promptId.substring(0, 6)}...
                  </p>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-gray-400">
              생성된 프리뷰가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePreviews;
