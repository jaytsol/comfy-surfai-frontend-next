"use client";

import React from "react";
import type { TemplateFormProps } from "../../interfaces/template-form.interface"; // 경로 확인
import ParameterField from "./ParameterField";
import InputFileField from "../common/InputFileField";
import { Coins } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  comfyUIStatus,
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

  const isButtonDisabled =
    isSubmitting || !selectedTemplateId || comfyUIStatus !== "ONLINE";

  const getTooltipMessage = () => {
    if (comfyUIStatus !== "ONLINE") {
      return "연산 서버가 오프라인 상태입니다.";
    }
    if (!selectedTemplateId) {
      return "템플릿을 선택해주세요.";
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {selectedTemplate.parameter_map && (
        <form onSubmit={onSubmit} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {selectedTemplate.name} - 파라미터 수정
          </h2>
          {selectedTemplate.description && <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(selectedTemplate.parameter_map)
              .filter(([_, paramConfig]) => paramConfig.type !== 'image') // 이미지 타입 파라미터 필터링
              .map(
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
          {(selectedTemplate.requiredImageCount || 0) > 0 && (
            <div className="col-span-full mt-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                입력 이미지
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: selectedTemplate.requiredImageCount || 0 }).map((_, index) => {
                  const imageId = `input-image-${index + 1}`;
                  const imageLabel = `이미지 ${index + 1}`;
                  const imagePreview = index === 0 ? inputImage : null; // Only first image uses inputImage state
                  const imageType = index === 0 ? 'inputImage' : 'secondInputImage'; // Assuming only two image inputs for now

                  return (
                    <InputFileField
                      key={imageId}
                      label={imageLabel}
                      id={imageId}
                      accept="image/*"
                      onChange={(e) => onImageUpload(e, imageType)}
                      preview={imagePreview}
                      previewAlt={imageLabel}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <div className="flex items-center mr-4 text-lg font-semibold text-gray-700">
              <Coins className="h-6 w-6 text-yellow-500 mr-2" />
              <span>{user?.coinBalance} 코인</span>
            </div>
            <TooltipProvider>
              <Tooltip open={isButtonDisabled ? undefined : false}>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <button
                      type="submit"
                      disabled={isButtonDisabled}
                      className={`px-6 py-2 rounded-md text-white font-semibold transition-colors ${
                        isButtonDisabled
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isSubmitting ? "생성 요청 중..." : "이미지 생성"}
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      )}
    </div>
  );
};

export default TemplateForm;
