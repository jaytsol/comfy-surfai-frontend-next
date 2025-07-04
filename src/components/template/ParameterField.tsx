"use client";

import React from 'react';
import type { ParameterFieldProps } from '@/interfaces/template-form.interface'; // 경로 확인 및 수정

const ParameterField: React.FC<ParameterFieldProps> = ({
  paramName,
  label,
  paramValue,
  onChange,
  inputType = 'text',
  description,
  options,
  className = '',
}) => {
  
  // inputType에 따라 적절한 HTML 입력 필드를 렌더링하는 함수
  const renderInput = () => {
    const commonProps = {
      id: paramName,
      name: paramName,
      onChange: onChange,
      className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
    };

    switch (inputType) {
      case 'textarea':
        return <textarea {...commonProps} value={paramValue ?? ''} rows={4} />;
      
      case 'select':
        return (
          <select {...commonProps} value={paramValue ?? ''}>
            <option value="">-- 선택 --</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      
      case 'number':
        return <input {...commonProps} type="number" value={paramValue ?? 0} />;
      
      case 'checkbox':
        return (
          <div className="mt-1">
            <input 
              {...commonProps} 
              type="checkbox" 
              checked={!!paramValue} 
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
        );
        
      case 'text':
      default:
        return <input {...commonProps} type="text" value={paramValue ?? ''} />;
      case 'image':
        return;
    }
  };

  return (
    <div className={className}>
      <label htmlFor={paramName} className="flex items-center text-sm font-medium text-gray-700">
        <span className="capitalize">{label}</span>
        
        {/* description prop이 있을 때만 툴팁 아이콘을 렌더링합니다. */}
        {description && (
          <div className="group relative flex items-center ml-2">
            <span className="text-gray-400 border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center text-xs font-mono cursor-help">
              ?
            </span>
            {/* 마우스를 올렸을 때 나타나는 툴팁 패널 */}
            <div className={`
              absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 
              p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              invisible group-hover:visible pointer-events-none
            `}>
              {description}
              <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
            </div>
          </div>
        )}
      </label>

      {renderInput()}
    </div>
  );
};

export default ParameterField;
