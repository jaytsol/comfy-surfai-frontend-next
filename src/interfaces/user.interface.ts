import { Role } from './role.enum'; // 같은 폴더에 있는 Role enum 임포트

/**
 * 프론트엔드 애플리케이션에서 사용될 사용자 정보의 타입을 정의합니다.
 * 백엔드의 /auth/profile 또는 /auth/login API의 성공 응답으로 받는
 * 사용자 객체의 구조와 일치해야 합니다.
 *
 * 비밀번호와 같은 민감한 정보는 절대 포함하지 않습니다.
 */
export interface User {
  /**
   * 데이터베이스에서 생성된 사용자의 고유 ID입니다.
   * @example 1
   */
  id: number;

  /**
   * 사용자의 로그인 아이디로 사용되는 이름입니다.
   * @example "testadmin"
   */
  username: string;

  /**
   * 사용자의 역할입니다.
   * 이 값을 사용하여 프론트엔드에서 특정 UI(예: '이미지 생성' 페이지 링크)를
   * 보이거나 숨기는 등 권한에 따른 분기 처리를 할 수 있습니다.
   */
  role: Role; // string 대신 Role Enum을 사용하여 타입 안전성을 확보합니다.

  // 만약 백엔드에서 이메일, 생성일 등 추가 정보를 제공한다면 여기에 추가할 수 있습니다.
  // email?: string;
  // createdAt?: string; // 또는 Date 타입
}
