// app/generate/page.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

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
import { usePagination } from "@/hooks/usePagination"; // usePagination 훅 임포트
import { Pagination } from "@/components/common/Pagination"; // Pagination 컴포넌트 임포트
import { PaginatedResponse } from "@/interfaces/pagination.interface"; // PaginatedResponse 임포트
import TemplateCard from "@/components/template/TemplateCard"; // TemplateCard 임포트

export default function GeneratePage() {
  const { user, isLoading: isAuthLoading, fetchUserProfile, updateCoinBalance } = useAuth();

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

  const { currentPage, totalPages, goToPage, setTotalItems } = usePagination({
    totalItems: 0,
    itemsPerPage: 9, // 한 페이지에 10개 항목
  });

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
    if (!isAuthLoading) {
      const fetchTemplates = async (page: number) => {
        setIsLoadingTemplates(true);
        try {
          const response = await apiClient<PaginatedResponse<WorkflowTemplate>>(
            `/workflow-templates?page=${page}&limit=10`
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
  }, [user, isAuthLoading, currentPage, setTotalItems]);

  // useEffect(() => {
  //   if (!isAuthLoading) {
  //     if (!user) router.replace("/login");
  //     else if (user.role !== "admin") {
  //       alert("관리자만 접근 가능합니다.");
  //       router.replace("/");
  //     }
  //   }
  // }, [user, isAuthLoading, router]);

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
  }, [selectedTemplateId]);

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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    // seed 필드는 특별 처리
    if (name === 'seed') {
      // 비어있거나, '-' 이거나, 유효한 정수(음수 포함) 형식일 때만 상태 업데이트
      if (value === '' || value === '-' || /^-?\d*$/.test(value)) {
        setParameterValues((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // 일반 숫자 입력 필드 처리
    if (type === 'number') {
      // 숫자(0-9)가 아닌 모든 문자를 제거
      const numericValue = value.replace(/[^0-9]/g, '');
      setParameterValues((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    // 체크박스 및 기타 타입 처리
    const parsedValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
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
          // 숫자 타입일 때 빈 문자열 검사 추가
          if (paramConfig.type === 'number' && value === '') {
            setApiError(`'${paramConfig.label || paramName}' 파라미터는 비워둘 수 없습니다.`);
            return;
          }
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
      // 에러 발생 시 낙관적 업데이트 롤백: 코인 복구
      if (user && selectedTemplate?.cost) {
        fetchUserProfile();
      }
      // 백엔드에서 '코인이 부족합니다.' 에러가 넘어왔을 경우, 프론트엔드의 메시지로 대체
      if (err.message === '코인이 부족합니다.') {
        const { batch_size = 1 } = parameterValues;
        const loopCount = Number(batch_size) || 1;
        const requiredCoins = (selectedTemplate?.cost || 0) * loopCount;
        setApiError(`코인이 부족합니다. ${requiredCoins} 코인이 필요하지만 현재 ${user?.coinBalance} 코인만 있습니다.`);
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

  // if (isAuthLoading || !user) {
  //   return <p className="text-center py-10">권한 확인 중...</p>;
  // }
  // if (user.role !== "admin") {
  //   return <p className="text-center py-10">접근 제한이 없습니다.</p>;
  // }

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

        {/* 템플릿 선택 카드 갤러리 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">워크플로우 템플릿 선택:</h2>
          {isLoadingTemplates ? (
            <p className="text-gray-600">템플릿 목록을 불러오는 중입니다...</p>
          ) : templates.length === 0 ? (
            <p className="text-orange-600">사용 가능한 워크플로우 템플릿이 없습니다. 먼저 템플릿을 생성해주세요.</p>
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

        {/* 선택된 템플릿의 파라미터 폼 */}
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
            user={user}
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
