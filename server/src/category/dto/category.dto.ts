import { IsString, IsOptional, IsInt, Min } from 'class-validator';

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

export class CategoryResponse {
  id: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
