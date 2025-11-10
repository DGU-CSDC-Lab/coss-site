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

export class UpdateUserInfoRequest {
  @ApiProperty({
    description: '사용자명',
    example: 'new_admin',
  })
  username: string;
}
