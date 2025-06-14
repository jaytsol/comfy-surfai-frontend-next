"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import HistoryGallery from '@/components/history/HistoryGallery';
import ImageLightbox from '@/components/common/ImageLightbox';
import { History as HistoryIcon } from 'lucide-react';
import type { HistoryItemData, PaginatedHistoryResponse } from '@/interfaces/history.interface';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<HistoryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

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
        setItems(prev => pageNum === 1 ? response.data : [...prev, ...response.data]);
        setHasMore(response.page < response.lastPage);
        setPage(pageNum);
      }
    } catch (err: any) {
      setError('생성 기록을 불러오는 데 실패했습니다: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => setViewingImageUrl(imageUrl);
  const handleCloseLightbox = () => setViewingImageUrl(null);

  const handleDelete = async (id: number) => {
    if (!confirm(`ID: ${id} 생성물을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    try {
      // TODO: 백엔드에 DELETE /my-outputs/:id API 구현 필요
      // await apiClient(`/my-outputs/${id}`, { method: 'DELETE' });
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      alert("성공적으로 삭제되었습니다.");
    } catch (err: any) {
      alert("삭제에 실패했습니다: " + err.message);
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
        <HistoryGallery items={items} onImageClick={handleImageClick} onDelete={handleDelete} />

        <div className="mt-8 text-center">
          {isLoading && <p className="text-gray-500">불러오는 중...</p>}
          {!isLoading && hasMore && (
            <Button onClick={handleLoadMore}>더 보기</Button>
          )}
          {!isLoading && !hasMore && items.length > 0 && (
            <p className="text-gray-500">마지막 페이지입니다.</p>
          )}
        </div>
        
        {error && <p className="mt-4 text-center text-red-600">오류: {error}</p>}
      </div>
      
      <ImageLightbox imageUrl={viewingImageUrl} onClose={handleCloseLightbox} />
    </div>
  );
}
