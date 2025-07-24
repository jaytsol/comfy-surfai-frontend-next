"use client";

import React from "react";
import type { TemplateFormProps } from "../../interfaces/template-form.interface"; // 경로 확인
import ParameterField from "./ParameterField";
import InputFileField from "../common/InputFileField";
import { Coins } from 'lucide-react';

const TemplateForm: React.FC<TemplateFormProps> = ({
  selectedTemplateId,
  onParameterChange,
  onSubmit,
  parameterValues,
  isSubmitting,
  selectedTemplate,
  isLoadingTemplates,
  onImageUpload,
  inputImage,
  user,
}) => {
  if (isLoadingTemplates) {
    return <p className="text-gray-600">템플릿 정보를 불러오는 중입니다...</p>;
  }

  if (!selectedTemplate) {
    return (
      <p className="text-orange-600">
        템플릿을 선택해주세요.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {selectedTemplate.parameter_map && (
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

          {/* 미디어 파일 입력 필드 (image, video, audio 등) */}
          {selectedTemplate.category && selectedTemplate.category.startsWith("image-to-") && (
            <div className="col-span-full mt-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                입력 이미지 (선택 사항):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputFileField
                  label="이미지 1"
                  id="input-image-1"
                  accept="image/*"
                  onChange={onImageUpload}
                  preview={inputImage}
                  previewAlt="Input Image 1 Preview"
                />
                <InputFileField
                  label="이미지 2"
                  id="input-image-2"
                  accept="image/*"
                  onChange={() => { /* 향후 구현 */ }}
                  preview={null}
                  previewAlt="Input Image 2 Preview"
                />
                <InputFileField
                  label="이미지 3"
                  id="input-image-3"
                  accept="image/*"
                  onChange={() => { /* 향후 구현 */ }}
                  preview={null}
                  previewAlt="Input Image 3 Preview"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <div className="flex items-center mr-4 text-lg font-semibold text-gray-700">
              <Coins className="h-6 w-6 text-yellow-500 mr-2" />
              <span>{user?.coinBalance} 코인</span>
            </div>
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
