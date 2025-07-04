/**
 * 히스토리 목록 API의 응답 데이터 중, 개별 생성물 하나의 타입을 정의합니다.
 */
/**
 * 생성 기록 아이템 하나의 데이터 타입 (이제 유일한 표준)
 */
export interface HistoryItemData {
    id: number;
    viewUrl: string;
    originalFilename: string;
    mimeType: string; // ✨ MIME 타입 추가 (예: 'image/png', 'video/mp4')
    createdAt: string;
    usedParameters?: Record<string, any>;
    promptId?: string;
    duration?: number;
}
  
/**
 * 히스토리 목록 API(/my-outputs)의 전체 응답 타입을 정의합니다.
*/
export interface PaginatedHistoryResponse {
    data: HistoryItemData[];
    total: number;
    page: number;
    lastPage: number;
}
