import React from 'react';

interface GenerationStatusProps {
  executionStatus: string | null;
  queueRemaining: number;
  progressValue: { value: number; max: number } | null;
  livePreviews: { url: string; promptId: string }[];
  error: string | null;
  isGenerating: boolean; // To show loading or initial state if needed
}

const GenerationStatus: React.FC<GenerationStatusProps> = ({
  executionStatus,
  queueRemaining,
  progressValue,
  livePreviews,
  error,
  isGenerating,
}) => {
  // Show nothing if not generating and no persistent status/error to show
  if (!isGenerating && !executionStatus && queueRemaining === 0 && livePreviews.length === 0 && !error) {
    // Or show a default message like "Ready to generate."
    // return <p className="text-gray-500">Ready to generate images.</p>;
    return null; 
  }

  return (
    <div className="mb-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-400 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Generation Status & Progress */}
      {(executionStatus || queueRemaining > 0 || progressValue || isGenerating) && (
        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          {isGenerating && !executionStatus && queueRemaining === 0 && <p className="text-blue-800">이미지 생성 요청 중...</p>}
          {executionStatus && <p className="text-blue-800">{executionStatus}</p>}
          {queueRemaining > 0 && (
            <p className="text-blue-700 mt-1">
              대기열: {queueRemaining}개 작업 남음
            </p>
          )}
          {progressValue && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(progressValue.value / progressValue.max) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Live Previews */}
      {livePreviews.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">실시간 프리뷰:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {livePreviews.map((preview, index) => (
              <div key={index} className="relative group aspect-square overflow-hidden rounded-lg shadow-md">
                <img
                  src={preview.url}
                  alt={`Live preview ${index + 1} for prompt ${preview.promptId}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  Prompt ID: {preview.promptId.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationStatus;
