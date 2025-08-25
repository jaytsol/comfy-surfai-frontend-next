// app/surf/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

// 컴포넌트 및 훅, 타입 임포트
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { useComfyWebSocket } from "@/hooks/useComfyWebSocket";
import SystemMonitor from "@/components/generate/SystemMonitor";
import TemplateForm from "@/components/template/TemplateForm";
import type {
  WorkflowTemplate,
} from "@/interfaces/workflow.interface";
import GenerationDisplay from "@/components/generate/GenerationDisplay";
import {
  GenerateImagePayload,
  ImageGenerationResponse,
} from "@/interfaces/api.interface";
import ItemLightbox from "@/components/common/ItemLightbox";
import type { HistoryItemData } from "@/interfaces/history.interface";
import OutputGallery from "@/components/common/OutputGallery";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import { PaginatedResponse } from "@/interfaces/pagination.interface";
import TemplateCard from "@/components/template/TemplateCard";

type ComfyUIStatus = "ONLINE" | "OFFLINE" | "CONNECTING" | "CLOSING" | "CHECKING...";

export default function GeneratePage() {
  const {
    user,
    isLoading: isAuthLoading,
    fetchUserProfile,
    updateCoinBalance,
  } = useAuth();

  // --- UI 및 폼 관련 상태 ---
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {}
  );
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [secondInputImage, setSecondInputImage] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<HistoryItemData | null>(null);
  const [urlCache, setUrlCache] = useState<Record<number, string>>({});

  const { currentPage, totalPages, goToPage, setTotalItems, itemsPerPage } =
    usePagination({
      totalItems: 0,
      itemsPerPage: 9,
    });

  const {
    comfyUIStatus, // Get status from the hook
    executionStatus,
    progressValue,
    systemMonitorData,
    queueRemaining,
    items,
    removeItem,
    addItem,
  } = useComfyWebSocket(user, isAuthLoading, fetchUserProfile);

  useEffect(() => {
    if (!isAuthLoading) {
      const fetchTemplates = async (page: number) => {
        setIsLoadingTemplates(true);
        try {
          const response = await apiClient<PaginatedResponse<WorkflowTemplate>>(
            `/public-workflow-templates?page=${page}&limit=${itemsPerPage}`
          );
          setTemplates(response.data);
          setTotalItems(response.total);
        } catch (err: any) {
          setApiError(
            "워크플로우 템플릿을 불러오는 데 실패했습니다: " + err.message
          );
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      fetchTemplates(currentPage);
    }
  }, [user, isAuthLoading, currentPage, itemsPerPage, setTotalItems]);

  useEffect(() => {
    if (selectedTemplateId) {
      const foundTemplate = templates.find(
        (t) => t.id === parseInt(selectedTemplateId, 10)
      );
      setSelectedTemplate(foundTemplate || null);
      const initialParams: Record<string, any> = {};
      if (foundTemplate?.parameter_map) {
        for (const key in foundTemplate.parameter_map) {
          const mappingInfo = foundTemplate.parameter_map[
            key
          ] as WorkflowParameterMappingItem;
          if (mappingInfo.default_value !== undefined) {
            initialParams[key] = mappingInfo.default_value;
          } else {
            try {
              const node = (foundTemplate.definition as any)[
                mappingInfo.node_id
              ];
              initialParams[key] =
                node?.inputs?.[mappingInfo.input_name] ?? "";
            } catch {
              initialParams[key] = "";
            }
          }
        }
      }
      setParameterValues(initialParams);
    } else {
      setSelectedTemplate(null);
      setParameterValues({});
    }
    setApiError(null);
  }, [selectedTemplateId, templates]);

  const handleImageClick = async (item: HistoryItemData) => {
    if (urlCache[item.id]) {
      setViewingItem(item);
      return;
    }
    try {
      const response = await apiClient<{ viewUrl: string }>(
        `/my-outputs/${item.id}/view-url`
      );
      const newUrl = response.viewUrl;
      setUrlCache((prevCache) => ({
        ...prevCache,
        [item.id]: newUrl,
      }));
      setViewingItem(item);
    } catch (error) {
      console.error(`Failed to get view URL for output ${item.id}`, error);
      setApiError("이미지를 확대하는 중 오류가 발생했습니다.");
    }
  };

  const handleCloseLightbox = () => {
    setViewingItem(null);
  };

  const handleParameterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "seed") {
      if (value === "" || value === "-" || /^-?\d*$/.test(value)) {
        setParameterValues((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (type === "number") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setParameterValues((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    const parsedValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setParameterValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, imageType: 'inputImage' | 'secondInputImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageType === 'inputImage') {
          setInputImage(reader.result as string);
        } else {
          setSecondInputImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (imageType === 'inputImage') {
        setInputImage(null);
      } else {
        setSecondInputImage(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      setApiError("먼저 워크플로우 템플릿을 선택해주세요.");
      return;
    }
    setApiError(null);

    const { batch_size = 1, ...restParameters } = parameterValues;
    const loopCount = Number(batch_size) || 1;
    const requiredCoins = (selectedTemplate?.cost || 0) * loopCount;

    if (user && user.coinBalance < requiredCoins) {
      setApiError(
        `코인이 부족합니다. ${requiredCoins} 코인이 필요하지만 현재 ${user.coinBalance} 코인만 있습니다.`
      );
      return;
    }

    if (selectedTemplate.requiredImageCount > 0) {
      if (!inputImage) {
        setApiError("첫 번째 입력 이미지가 필요합니다.");
        return;
      }
      if (selectedTemplate.requiredImageCount > 1 && !secondInputImage) {
        setApiError("두 번째 입력 이미지가 필요합니다.");
        return;
      }
    }

    setIsSubmitting(true);

    if (user && selectedTemplate?.cost) {
      updateCoinBalance(-selectedTemplate.cost * loopCount);
    }

    const payload: GenerateImagePayload = {
      templateId: selectedTemplate.id,
      parameters: restParameters,
      inputImage: inputImage || undefined,
      secondInputImage: secondInputImage || undefined,
    };

    try {
      for (let i = 0; i < loopCount; i++) {
        await apiClient<ImageGenerationResponse>("/api/generate", {
          method: "POST",
          body: payload,
        });
      }
    } catch (err: any) {
      if (user && selectedTemplate?.cost) {
        fetchUserProfile();
      }
      if (err.message === "코인이 부족합니다.") {
        const { batch_size = 1 } = parameterValues;
        const loopCount = Number(batch_size) || 1;
        const requiredCoins = (selectedTemplate?.cost || 0) * loopCount;
        setApiError(
          `코인이 부족합니다. ${requiredCoins} 코인이 필요하지만 현재 ${user?.coinBalance} 코인만 있습니다.`
        );
      } else {
        setApiError(
          err.message || "이미지 생성 요청 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ID: #${id} 생성물을 정말로 삭제하시겠습니까?`)) {
      return;
    }
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;
    removeItem(id);
    try {
      await apiClient(`/my-outputs/${id}`, { method: "DELETE" });
    } catch (err: any) {
      alert("삭제에 실패했습니다: " + err.message);
      addItem(itemToDelete);
    }
  };

  const getStatusIndicator = (status: ComfyUIStatus) => {
    switch (status) {
      case "ONLINE":
        return {
          text: "온라인",
          className: "text-green-600",
          dotClassName: "bg-green-500",
        };
      case "OFFLINE":
        return {
          text: "오프라인",
          className: "text-red-600",
          dotClassName: "bg-red-500",
        };
      default:
        return {
          text: "확인 중...",
          className: "text-yellow-600",
          dotClassName: "bg-yellow-500",
        };
    }
  };

  const statusIndicator = getStatusIndicator(comfyUIStatus);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            이미지 생성
          </h1>
          <p className="text-sm mt-2 flex items-center">
            <span
              className={`w-2.5 h-2.5 rounded-full mr-2 ${statusIndicator.dotClassName}`}
            />
            <span className="mr-1">연산 서버:</span>
            <span className={`font-semibold ${statusIndicator.className}`}>
              {statusIndicator.text}
            </span>
          </p>
        </div>

        {comfyUIStatus === 'ONLINE' && <SystemMonitor data={systemMonitorData} />}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">
            워크플로우 템플릿 선택:
          </h2>
          {isLoadingTemplates ? (
            <p className="text-gray-600">템플릿 목록을 불러오는 중입니다...</p>
          ) : templates.length === 0 ? (
            <p className="text-orange-600">
              사용 가능한 워크플로우 템플릿이 없습니다. 먼저 템플릿을
              생성해주세요.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id.toString()}
                  onClick={() => setSelectedTemplateId(template.id.toString())}
                />
              ))}
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>

        {selectedTemplate && (
          <TemplateForm
            selectedTemplateId={selectedTemplateId}
            onParameterChange={handleParameterChange}
            onSubmit={handleSubmit}
            parameterValues={parameterValues}
            isSubmitting={isSubmitting}
            selectedTemplate={selectedTemplate}
            isLoadingTemplates={isLoadingTemplates}
            onImageUpload={handleImageUpload}
            inputImage={inputImage}
            secondInputImage={secondInputImage}
            user={user}
            comfyUIStatus={comfyUIStatus}
          />
        )}

        <GenerationDisplay
          isSubmitting={isSubmitting}
          executionStatus={executionStatus}
          queueRemaining={queueRemaining}
          progressValue={progressValue}
          error={apiError}
          className="mt-6"
        />

        <OutputGallery
          items={items}
          onImageClick={handleImageClick}
          onDelete={handleDelete}
          layout="scroll"
          title="이번 세션의 생성 기록"
          sortOrder="newest-first"
          emptyStateMessage={<></>}
        />
      </div>
      <ItemLightbox onClose={handleCloseLightbox} item={viewingItem} />
    </div>
  );
}
