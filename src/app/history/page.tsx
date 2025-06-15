"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import HistoryGallery from "@/components/history/HistoryGallery";
import ItemLightbox from "@/components/common/ItemLightbox";
import { History as HistoryIcon } from "lucide-react";
import type {
  HistoryItemData,
  PaginatedHistoryResponse,
} from "@/interfaces/history.interface";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [items, setItems] = useState<HistoryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewingItem, setViewingItem] = useState<HistoryItemData | null>(null);
  const [lightboxUrlCache, setLightboxUrlCache] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchHistory(1);
    }
  }, [isAuthLoading, user]);

  const fetchHistory = async (pageNum: number) => {
    // 이미 로딩 중이거나 더 이상 페이지가 없으면 return
    if (isLoading && pageNum > 1) return;
    if (!hasMore && pageNum > page) return;

    setIsLoading(true);
    try {
      const response = await apiClient<PaginatedHistoryResponse>(
        `/my-outputs?page=${pageNum}&limit=12`
      );
      if (response && response.data) {
        setItems((prev) =>
          pageNum === 1 ? response.data : [...prev, ...response.data]
        );
        setHasMore(response.page < response.lastPage);
        setPage(pageNum);
      }
    } catch (err: any) {
      setError("생성 기록을 불러오는 데 실패했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ --- 캐싱 로직이 포함된 이미지 클릭 핸들러 --- ✨
  const handleImageClick = async (item: HistoryItemData) => {
    // 캐시에 이미 확대용 URL이 있는지 확인합니다.
    if (lightboxUrlCache[item.id]) {
      setViewingItem(item); // 캐시된 URL을 사용할 것이므로 라이트박스만 엽니다.
      return;
    }

    // 캐시에 없다면, 백엔드에 확대용 URL을 새로 요청합니다.
    try {
      const response = await apiClient<{ viewUrl: string }>(
        `/my-outputs/${item.id}/view-url`
      );
      const newUrl = response.viewUrl;
      // 받아온 URL을 캐시에 저장합니다.
      setLightboxUrlCache((prevCache) => ({ ...prevCache, [item.id]: newUrl }));
      // 라이트박스를 엽니다.
      setViewingItem(item);
    } catch (err) {
      alert("이미지를 확대하는 데 오류가 발생했습니다.");
    }
  };
  const handleCloseLightbox = () => setViewingItem(null);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        `ID: ${id} 생성물을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    // ✨ 삭제하려는 아이템을 임시 저장 (실패 시 복구용)
    const itemToDelete = items.find((item) => item.id === id);
    if (!itemToDelete) return;

    // ✨ "낙관적 업데이트": UI에서 먼저 아이템을 제거하여 빠른 사용자 경험 제공
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));

    try {
      // ✨ 백엔드에 DELETE API 호출
      await apiClient(`/my-outputs/${id}`, { method: "DELETE" });
      // 성공 로그 (선택 사항)
      console.log(`Item #${id} deleted successfully.`);
    } catch (err: any) {
      // ✨ API 호출 실패 시, UI를 원래 상태로 복구
      alert("삭제에 실패했습니다: " + err.message);
      setItems((prevItems) =>
        [...prevItems, itemToDelete].sort((a, b) => b.id - a.id)
      ); // 다시 추가하고 정렬
    }
  };

  const handleLoadMore = () => {
    fetchHistory(page + 1);
  };

  if (isAuthLoading || !user) {
    return <p className="text-center py-10">사용자 정보를 확인 중입니다...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HistoryIcon className="h-8 w-8" />
          나의 생성 기록
        </h1>
        <p className="text-muted-foreground">
          과거에 생성했던 이미지 및 비디오를 확인하고 관리합니다.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <HistoryGallery
          items={items}
          onImageClick={handleImageClick}
          onDelete={handleDelete}
        />

        <div className="mt-8 text-center">
          {isLoading && <p className="text-gray-500">불러오는 중...</p>}
          {!isLoading && hasMore && (
            <Button onClick={handleLoadMore}>더 보기</Button>
          )}
          {!isLoading && !hasMore && items.length > 0 && (
            <p className="text-gray-500">마지막 페이지입니다.</p>
          )}
        </div>

        {error && (
          <p className="mt-4 text-center text-red-600">오류: {error}</p>
        )}
      </div>

      <ItemLightbox
        onClose={handleCloseLightbox}
        item={viewingItem} // 메타데이터 표시를 위해 item 객체도 전달
      />
    </div>
  );
}
