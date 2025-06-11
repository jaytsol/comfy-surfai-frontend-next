/**
 * 이미지 생성을 요청할 때 (`POST /api/generate`)
 * 프론트엔드가 백엔드로 보내는 요청 본문(payload)의 타입을 정의합니다.
 */
export interface GenerateImagePayload {
    /**
     * 사용할 워크플로우 템플릿의 고유 ID.
     */
    templateId: number;
  
    /**
     * 템플릿의 기본값을 덮어쓸 동적 파라미터들입니다.
     * 키는 템플릿의 `parameter_map`에 정의된 의미론적 이름(예: "positive_prompt")이어야 합니다.
     * 값은 해당 파라미터에 설정할 새로운 값(문자열, 숫자 등)입니다.
     * 이 필드는 선택 사항이며, 보내지 않으면 템플릿의 기본값으로 이미지가 생성됩니다.
     */
    parameters?: Record<string, any>;
  }
  
  
  /**
   * 이미지 생성 요청(`POST /api/generate`) 후,
   * 백엔드에서 즉시 반환하는 응답의 `data` 필드 타입을 정의합니다.
   * 이 응답에는 최종 이미지 URL이 포함되지 않으며, 주로 작업 추적을 위한 ID가 포함됩니다.
   */
  export interface ImageGenerationInitialData {
    /**
     * ComfyUI가 생성한 고유한 작업(프롬프트) ID입니다.
     * 이 ID를 사용하여 WebSocket을 통해 해당 작업의 실시간 진행 상태를 추적합니다.
     */
    prompt_id: string;
    
    // 필요하다면, ComfyUI가 반환하는 다른 초기 정보(예: 노드 에러)를 여기에 추가할 수 있습니다.
  }
  
  
  /**
   * 이미지 생성을 요청한 후 백엔드로부터 받는 전체 응답의 타입을 정의합니다.
   */
  export interface ImageGenerationResponse {
    /**
     * API 요청이 성공적으로 접수되었는지 여부.
     */
    success: boolean;
  
    /**
     * API 요청 결과에 대한 간단한 메시지.
     * (예: "이미지 생성 작업이 성공적으로 시작되었습니다.")
     */
    message: string;
  
    /**
     * 요청 성공 시 반환되는 데이터.
     * `prompt_id`를 포함하여, 프론트엔드가 실시간 진행 상태를 추적하는 데 사용됩니다.
     */
    data?: ImageGenerationInitialData;
  }
  