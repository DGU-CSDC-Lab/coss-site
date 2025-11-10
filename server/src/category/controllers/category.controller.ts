import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoryService } from '@/category/services/category.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  CategoryCreate,
  CategoryUpdate,
  CategoryResponse,
} from '@/category/dto/category.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Categories')
@Controller()
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('api/v1/categories')
  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '성공', type: [CategoryResponse] })
  async getCategories(@Query('parentId') parentId?: string): Promise<CategoryResponse[]> {
    return this.categoryService.findAll(parentId);
  }

  @Post('api/v1/admin/categories')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async createCategory(@Body() createDto: CategoryCreate): Promise<CategoryResponse> {
    return this.categoryService.create(createDto);
  }

  @Put('api/v1/admin/categories/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 수정' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: CategoryUpdate,
  ): Promise<CategoryResponse> {
    return this.categoryService.update(id, updateDto);
  }

  @Delete('api/v1/admin/categories/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '하위 카테고리가 있어 삭제할 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
