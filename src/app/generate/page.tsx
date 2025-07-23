// app/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// 컴포넌트 및 훅, 타입 임포트 (경로는 실제 프로젝트 구조에 맞게 수정)
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { useComfyWebSocket } from "@/hooks/useComfyWebSocket";
import SystemMonitor from "@/components/generate/SystemMonitor";
import TemplateForm from "@/components/template/TemplateForm";
import type { WorkflowTemplate, WorkflowParameterMappingItem } from "@/interfaces/workflow.interface";
import GenerationDisplay from "@/components/generate/GenerationDisplay";
import {
  GenerateImagePayload,
  ImageGenerationResponse,
} from "@/interfaces/api.interface";
import ItemLightbox from "@/components/common/ItemLightbox";
import type { HistoryItemData } from "@/interfaces/history.interface";
import OutputGallery from "@/components/common/OutputGallery";

export default function GeneratePage() {
  const { user, isLoading: isAuthLoading, fetchUserProfile, updateCoinBalance } = useAuth();
  const router = useRouter();

  // --- UI 및 폼 관련 상태 ---
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {}
  );
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<HistoryItemData | null>(null);
  const [urlCache, setUrlCache] = useState<Record<number, string>>({});

  const {
    isWsConnected,
    executionStatus,
    progressValue,
    systemMonitorData,
    queueRemaining,
    items,
    removeItem,
    addItem,
  } = useComfyWebSocket(user, isAuthLoading, fetchUserProfile);

  useEffect(() => {
    if (!isAuthLoading && user?.role === "admin") {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
          const fetchedTemplates = await apiClient<WorkflowTemplate[]>(
            "/workflow-templates"
          );
          setTemplates(fetchedTemplates || []);
        } catch (err: any) {
          setApiError(
            "워크플로우 템플릿을 불러오는 데 실패했습니다: " + err.message
          );
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) router.replace("/login");
      else if (user.role !== "admin") {
        alert("관리자만 접근 가능합니다.");
        router.replace("/");
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (selectedTemplateId) {
      const foundTemplate = templates.find(
        (t) => t.id === parseInt(selectedTemplateId, 10)
      );
      setSelectedTemplate(foundTemplate || null);
      const initialParams: Record<string, any> = {};
      if (foundTemplate?.parameter_map) {
        for (const key in foundTemplate.parameter_map) {
          const mappingInfo = foundTemplate.parameter_map[key] as WorkflowParameterMappingItem;
          if (mappingInfo.default_value !== undefined) {
            initialParams[key] = mappingInfo.default_value;
          } else {
            try {
              const node = (foundTemplate.definition as any)[mappingInfo.node_id];
              initialParams[key] = node?.inputs?.[mappingInfo.input_name] ?? "";
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
    let parsedValue: string | number | boolean = value;

    if (type === "number") {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        parsedValue = 0; // 또는 다른 기본값
      }
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setParameterValues((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setInputImage(null);
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
      setApiError(`코인이 부족합니다. ${requiredCoins} 코인이 필요하지만 현재 ${user.coinBalance} 코인만 있습니다.`);
      return;
    }

    // --- 유효성 검사 로직 추가 ---
    if (selectedTemplate.parameter_map) {
      for (const [paramName, paramConfig] of Object.entries(selectedTemplate.parameter_map)) {
        const value = parameterValues[paramName];
        const rules = paramConfig.validation;

        if (rules) {
          if (rules.min !== undefined && value < rules.min) {
            setApiError(`'${paramConfig.label || paramName}' 파라미터 값(${value})은(는) 최소값 ${rules.min}보다 작을 수 없습니다.`);
            return;
          }
          if (rules.max !== undefined && value > rules.max) {
            setApiError(`'${paramConfig.label || paramName}' 파라미터 값(${value})은(는) 최대값 ${rules.max}보다 클 수 없습니다.`);
            return;
          }
        }
      }
    }
    
    setIsSubmitting(true);

    // 낙관적 업데이트: 코인 차감
    if (user && selectedTemplate?.cost) {
      updateCoinBalance(-selectedTemplate.cost * loopCount);
    }

    const payload: GenerateImagePayload = {
      templateId: selectedTemplate.id,
      parameters: restParameters,
      inputImage: inputImage || undefined, // inputImage가 null이면 undefined로 전송
    };

    try {
      for (let i = 0; i < loopCount; i++) {
        await apiClient<ImageGenerationResponse>("/api/generate", {
          method: "POST",
          body: payload,
        });
      }
      // 이미지 생성 성공 후 사용자 프로필을 다시 가져와 코인 잔액 업데이트
      // fetchUserProfile(); // 낙관적 업데이트 후에는 필요 없음
    } catch (err: any) {
      // 백엔드에서 '코인이 부족합니다.' 에러가 넘어왔을 경우, 프론트엔드의 메시지로 대체
      if (err.message === '코인이 부족합니다.') {
        const { batch_size = 1 } = parameterValues;
        const loopCount = Number(batch_size) || 1;
        const requiredCoins = (selectedTemplate?.cost || 0) * loopCount;
        setApiError(`코인이 부족합니다. ${requiredCoins} 코인이 필요하지만 현재 ${user.coinBalance} 코인만 있습니다.`);
      } else {
        setApiError(err.message || "이미지 생성 요청 중 오류가 발생했습니다.");
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

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">권한 확인 중...</p>;
  }
  if (user.role !== "admin") {
    return <p className="text-center py-10">접근 제한이 없습니다.</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            이미지 생성
          </h1>
          <p className="text-sm mt-2">
            WebSocket:
            <span
              className={`font-semibold ${
                isWsConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {isWsConnected ? "연결됨" : "연결 끊김"}
            </span>
          </p>
        </div>

        <SystemMonitor data={systemMonitorData} />

        <TemplateForm
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedTemplateId(e.target.value)
          }
          onParameterChange={handleParameterChange}
          onSubmit={handleSubmit}
          parameterValues={parameterValues}
          isSubmitting={isSubmitting}
          selectedTemplate={selectedTemplate}
          isLoadingTemplates={isLoadingTemplates}
          onImageUpload={handleImageUpload} // 추가
          inputImage={inputImage} // 추가
          user={user} // user 객체 전달
        />

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
