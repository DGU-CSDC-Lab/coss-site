import { IsString, IsOptional, IsInt, Min } from 'class-validator';

// 카테고리 생성 요청 DTO
export class CategoryCreate {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number = 0;
}

// 카테고리 수정 요청 DTO
export class CategoryUpdate {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

// 카테고리 응답 DTO
export class CategoryResponse {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  order: number;
  createdAt: Date;
}
