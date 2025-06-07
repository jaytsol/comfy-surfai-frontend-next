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
      <h3 className="text-xl font-semibold mb-3 text-gray-700">실시간 프리뷰:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group aspect-square overflow-hidden rounded-lg shadow-md">
            <img
              src={preview.url}
              alt={`Live preview ${index + 1} for prompt ${preview.promptId}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              Prompt ID: {preview.promptId.substring(0, 8)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivePreviews;
