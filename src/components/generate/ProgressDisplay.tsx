// src/components/progress/ProgressDisplay.tsx

import React from 'react';

interface ProgressDisplayProps {
  isSubmitting: boolean;
  executionStatus: string | null;
  progressValue: { value: number; max: number } | null;
  className?: string;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  isSubmitting,
  executionStatus,
  progressValue,
  className = '',
}) => {
  // ✨ 렌더링 조건 변경: isSubmitting이 true이거나, executionStatus/progressValue가 있을 때 렌더링
  if (!isSubmitting && !executionStatus && !progressValue) {
    return null;
  }

  // ✨ 표시할 상태 텍스트 결정: WebSocket 메시지가 있으면 그걸 쓰고, 없으면 isSubmitting 상태에 따라 초기 메시지 표시
  const statusToShow = executionStatus || (isSubmitting ? '서버에 생성 요청 전송 중...' : null);

  return (
    <div className={`${className}`}>
      {statusToShow && <p className="text-blue-800 animate-pulse">{statusToShow}</p>}
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

export default ProgressDisplay;
