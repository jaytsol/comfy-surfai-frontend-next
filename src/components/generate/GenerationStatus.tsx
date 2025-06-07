import React from 'react';

interface GenerationStatusProps {
  executionStatus: string | null;
  queueRemaining: number;
  progressValue: { value: number; max: number } | null;
  error: string | null;
  isGenerating: boolean;
  className?: string;
}

const GenerationStatus: React.FC<GenerationStatusProps> = ({
  executionStatus,
  queueRemaining,
  progressValue,
  error,
  isGenerating,
  className = '',
}) => {
  // Show nothing if not generating and no persistent status/error to show
  if (!isGenerating && !executionStatus && queueRemaining === 0 && !error) {
    return null; 
  }

  return (
    <div className={`mb-6 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-400 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Generation Status & Progress */}
      {(executionStatus || queueRemaining > 0 || progressValue || isGenerating) && (
        <div className="p-4 bg-blue-50 rounded-lg">
          {isGenerating && !executionStatus && queueRemaining === 0 && (
            <p className="text-blue-800">이미지 생성 요청 중...</p>
          )}
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
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationStatus;
