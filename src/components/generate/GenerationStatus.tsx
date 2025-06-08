import React from 'react';
import QueueStatus from './QueueStatus';
import ProgressStatus from './ProgressStatus';

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
    <div className={`space-y-4 mb-6 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Queue Status - Shows only queue information */}
      <QueueStatus 
        queueRemaining={queueRemaining} 
        className="p-4 bg-blue-50 rounded-lg"
      />

      {/* Progress Status - Shows execution status and progress bar */}
      <ProgressStatus
        executionStatus={isGenerating && !executionStatus && queueRemaining === 0 
          ? '이미지 생성 요청 중...' 
          : executionStatus}
        progressValue={progressValue}
        className="p-4 bg-blue-50 rounded-lg"
      />
    </div>
  );
};

export default GenerationStatus;
