"use client";

import React, { ChangeEvent } from 'react';

// ParameterField가 받을 props 타입을 정의합니다.
interface ParameterFieldProps {
  paramName: string; // HTML 'name' 속성으로 사용될 파라미터의 키
  label: string; // 사용자에게 보여질 레이블 텍스트
  paramValue: any;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  inputType?: 'text' | 'number' | 'textarea' | 'checkbox' | 'select';
  description?: string; // 툴팁으로 표시될 설명
  options?: string[]; // inputType이 'select'일 경우의 선택 옵션
  className?: string;
}

const ParameterField: React.FC<ParameterFieldProps> = ({
  paramName,
  label,
  paramValue,
  onChange,
  inputType = 'text', // 기본값은 'text'
  description,
  options,
  className = '',
}) => {
  
  // inputType에 따라 다른 종류의 입력 필드를 렌더링합니다.
  const renderInput = () => {
    const commonProps = {
      id: paramName,
      name: paramName,
      onChange: onChange,
      className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
    };

    switch (inputType) {
      case 'textarea':
        return <textarea {...commonProps} value={paramValue} rows={3} />;
      
      case 'select':
        return (
          <select {...commonProps} value={paramValue}>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      
      case 'number':
        return <input {...commonProps} type="number" value={paramValue} />;
      
      case 'checkbox':
        return (
          <input 
            {...commonProps} 
            type="checkbox" 
            checked={!!paramValue} 
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        );
        
      case 'text':
      default:
        return <input {...commonProps} type="text" value={paramValue} />;
    }
  };

  return (
    <div className={className}>
      <label htmlFor={paramName} className="flex items-center text-sm font-medium text-gray-700">
        <span className="capitalize">{label}</span>
        {description && (
          <span
            title={description}
            className="ml-2 text-gray-400 hover:text-gray-600 cursor-help border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
          >
            ?
          </span>
        )}
      </label>
      {renderInput()}
    </div>
  );
};

export default ParameterField;
