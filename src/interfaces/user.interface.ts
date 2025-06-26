// Role enum은 별도의 파일(예: enums/role.enum.ts)로 관리하거나,
// 여기에 함께 정의할 수 있습니다.
export enum Role {
  User = 'user',
  Admin = 'admin',
}

/**
 * 프론트엔드 애플리케이션 전체에서 사용될 사용자 정보의 타입을 정의합니다.
 * 백엔드의 /auth/profile API 응답 또는 로그인 성공 시 받는
 * 사용자 객체의 구조와 일치해야 합니다.
 */
export interface User {
  /**
   * 데이터베이스에 저장된 사용자의 고유 ID입니다.
   */
  id: number;

  /**
   * 사용자의 이메일 주소입니다.
   */
  email: string;

  /**
   * 사용자에게 보여질 이름(닉네임)입니다.
   */
  displayName: string;

  /**
   * 사용자의 프로필 사진 URL입니다. (Google 계정에서 가져옴)
   * 선택 사항일 수 있으므로 '?'를 붙입니다.
   */
  imageUrl?: string;

  /**
   * 사용자의 역할입니다. (admin 또는 user)
   * 이 값을 사용하여 관리자 전용 UI 등을 제어할 수 있습니다.
   */
  role: Role;

  /**
   * 사용자가 가입한 날짜입니다. (ISO 8601 형식의 문자열)
   */
  createdAt: string;

  /**
   * Google을 통해 가입했는지 여부를 판단하는 데 사용할 수 있습니다.
   * 일반 이메일/비밀번호로 가입한 경우 이 값은 null입니다.
   */
  googleId?: string | null;

  // 참고: password와 같은 민감한 정보는 절대 이 인터페이스에 포함되지 않습니다.
}
