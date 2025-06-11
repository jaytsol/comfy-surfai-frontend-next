import React from 'react';

interface QueueDisplayProps {
  queueRemaining: number;
  className?: string;
}

const QueueDisplay: React.FC<QueueDisplayProps> = ({
  queueRemaining,
  className = '',
}) => {
  if (queueRemaining <= 0) return null;

  return (
    <div className={`${className}`}>
      <p className="text-blue-700">대기열: {queueRemaining}개 작업 남음</p>
    </div>
  );
};

export default QueueDisplay;
