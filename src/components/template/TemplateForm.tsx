"use client";

import React from "react";
import type { TemplateFormProps } from "../../interfaces/template-form.interface"; // 경로 확인
import ParameterField from "./ParameterField";

const TemplateForm: React.FC<TemplateFormProps> = ({
  templates,
  selectedTemplateId,
  onTemplateChange,
  onParameterChange,
  onSubmit,
  parameterValues,
  isSubmitting,
  selectedTemplate,
  isLoadingTemplates,
}) => {
  if (isLoadingTemplates) {
    return <p className="text-gray-600">템플릿 목록을 불러오는 중입니다...</p>;
  }

  if (!isLoadingTemplates && templates.length === 0) {
    return (
      <p className="text-orange-600">
        사용 가능한 워크플로우 템플릿이 없습니다. 먼저 템플릿을 생성해주세요.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="template-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          워크플로우 템플릿 선택:
        </label>
        <select
          id="template-select"
          value={selectedTemplateId}
          onChange={onTemplateChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">-- 템플릿을 선택하세요 --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id.toString()}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && selectedTemplate.parameter_map && (
        <form onSubmit={onSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {selectedTemplate.name} - 파라미터 수정
          </h2>
          {selectedTemplate.description && <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(selectedTemplate.parameter_map).map(
              ([paramName, paramConfig]) => {
                const label = paramConfig.label ?? paramName.replace(/_/g, ' ');
                const inputType = paramConfig.type === 'boolean' ? 'checkbox' : paramConfig.type;
                const description = paramConfig.description;
                const options = paramConfig.options;

                return (
                  <ParameterField
                    key={paramName}
                    paramName={paramName}
                    label={label}
                    paramValue={parameterValues[paramName] ?? ''}
                    onChange={onParameterChange}
                    inputType={inputType}
                    description={description}
                    options={options}
                    className={inputType === 'textarea' ? 'md:col-span-2' : 'col-span-1'}
                  />
                );
              }
            )}
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedTemplateId}
              className={`px-6 py-2 rounded-md text-white font-semibold transition-colors ${
                isSubmitting || !selectedTemplateId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? "생성 요청 중..." : "이미지 생성"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TemplateForm;
