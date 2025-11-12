import { ApiProperty } from "@nestjs/swagger";

// 사용자 정보 응답 DTO
export class UserInfoResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '사용자명',
    example: 'admin',
  })
  username: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'ADMIN',
  })
  role: string;

  @ApiProperty({
    description: '이메일',
    example: 'admin@iot.ac.kr',
  })
  email: string;
}

// 사용자 정보 응답 DTO
export class AdminInfoResponse extends UserInfoResponse {
  @ApiProperty({
    description: '생성일',
    example: '2024-06-01T12:34:56Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '첫 로그인 여부',
    example: false,
  })
  isFirstLogin: boolean;

  @ApiProperty({
    description: '비밀번호 설정 토큰 만료 여부',
    example: false,
    required: false,
  })
  isLinkExpired?: boolean;
}


export class UpdateUserInfoRequest {
  @ApiProperty({
    description: '사용자명',
    example: 'new_admin',
  })
  username: string;
}
