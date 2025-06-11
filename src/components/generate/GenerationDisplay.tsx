import React from 'react';
import QueueDisplay from './QueueDisplay';
import ProgressDisplay from './ProgressDisplay';

interface GenerationDisplayProps {
  executionStatus: string | null;
  queueRemaining: number;
  progressValue: { value: number; max: number } | null;
  error: string | null;
  isSubmitting: boolean;
  className?: string;
}

const GenerationDisplay: React.FC<GenerationDisplayProps> = ({
  executionStatus,
  queueRemaining,
  progressValue,
  error,
  isSubmitting,
  className = '',
}) => {
  // Show nothing if not generating and no persistent status/error to show
  if (!isSubmitting && !executionStatus && queueRemaining === 0 && !error) {
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
      <QueueDisplay 
        queueRemaining={queueRemaining} 
        className="p-4 bg-blue-50 rounded-lg"
      />

      {/* Progress Status - Shows execution status and progress bar */}
      <ProgressDisplay
        isSubmitting={isSubmitting}
        executionStatus={isSubmitting && !executionStatus && queueRemaining === 0 
          ? '이미지 생성 요청 중...' 
          : executionStatus}
        progressValue={progressValue}
        className="p-4 bg-blue-50 rounded-lg"
      />
    </div>
  );
};

export default GenerationDisplay;
