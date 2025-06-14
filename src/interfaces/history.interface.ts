/**
 * 히스토리 목록 API의 응답 데이터 중, 개별 생성물 하나의 타입을 정의합니다.
 */
export interface HistoryItemData {
    id: number;
    viewUrl: string; // 표시용으로 생성된 미리 서명된 URL
    originalFilename: string;
    createdAt: string; // ISO 8601 형식의 문자열
    usedParameters?: Record<string, any>;
    // 필요하다면 다른 메타데이터 추가
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
  