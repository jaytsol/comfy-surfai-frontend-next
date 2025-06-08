import React from 'react';

interface ProgressStatusProps {
  executionStatus: string | null;
  progressValue: { value: number; max: number } | null;
  className?: string;
}

const ProgressStatus: React.FC<ProgressStatusProps> = ({
  executionStatus,
  progressValue,
  className = '',
}) => {
  if (!executionStatus && !progressValue) return null;

  return (
    <div className={`${className}`}>
      {executionStatus && <p className="text-blue-800">{executionStatus}</p>}
      {progressValue && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(progressValue.value / progressValue.max) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressStatus;
