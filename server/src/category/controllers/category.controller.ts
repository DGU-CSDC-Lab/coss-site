import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CategoryCreate, CategoryUpdate, CategoryResponse } from '../dto/category.dto';

@ApiTags('Categories')
@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('api/v1/categories')
  @ApiOperation({ summary: '카테고리 목록 조회', description: '계층형 카테고리 목록을 조회합니다.' })
  @ApiQuery({ name: 'parentId', required: false, description: '부모 카테고리 ID (없으면 최상위 카테고리)' })
  @ApiResponse({ status: 200, description: '카테고리 목록', type: [CategoryResponse] })
  async getCategories(@Query('parentId') parentId?: string): Promise<CategoryResponse[]> {
    return this.categoryService.findAll(parentId);
  }

  @Post('api/v1/admin/categories')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 생성', description: '새로운 카테고리를 생성합니다. (관리자 전용)' })
  @ApiBody({ type: CategoryCreate })
  @ApiResponse({ status: 201, description: '카테고리 생성 완료', type: CategoryResponse })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async createCategory(@Body() createDto: CategoryCreate): Promise<CategoryResponse> {
    return this.categoryService.create(createDto);
  }

  @Put('api/v1/admin/categories/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 수정', description: '기존 카테고리를 수정합니다. (관리자 전용)' })
  @ApiParam({ name: 'id', description: '카테고리 ID' })
  @ApiBody({ type: CategoryUpdate })
  @ApiResponse({ status: 200, description: '카테고리 수정 완료', type: CategoryResponse })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async updateCategory(@Param('id') id: string, @Body() updateDto: CategoryUpdate): Promise<CategoryResponse> {
    return this.categoryService.update(id, updateDto);
  }

  @Delete('api/v1/admin/categories/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 삭제', description: '카테고리를 삭제합니다. (관리자 전용)' })
  @ApiParam({ name: 'id', description: '카테고리 ID' })
  @ApiResponse({ status: 204, description: '카테고리 삭제 완료' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '하위 카테고리가 있어 삭제할 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
