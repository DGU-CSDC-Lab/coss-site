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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { HeaderAssetService } from '@/header-asset/services/header-asset.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  HeaderAssetCreate,
  HeaderAssetUpdate,
  HeaderAssetResponse,
  HeaderAssetQuery,
} from '@/header-asset/dto/header-asset.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('Header Assets')
@Controller()
export class HeaderAssetController {
  constructor(private headerAssetService: HeaderAssetService) {}

  @Get('api/v1/header-assets')
  @ApiOperation({
    summary: '헤더 에셋 목록 조회',
    description: '헤더 에셋 목록을 조회합니다. 활성화 상태별 필터링과 페이지네이션을 지원합니다.',
  })
  @ApiQuery({ name: 'isActive', required: false, description: '활성화 상태 필터', example: true })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기', example: 10 })
  @ApiResponse({
    status: 200,
    description: '헤더 에셋 목록 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/HeaderAssetResponse' },
                },
                meta: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    size: { type: 'number' },
                    totalElements: { type: 'number' },
                    totalPages: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getHeaderAssets(
    @Query() query: HeaderAssetQuery,
  ): Promise<PagedResponse<HeaderAssetResponse>> {
    return this.headerAssetService.findAll(query);
  }

  @Get('api/v1/header-assets/:id')
  @ApiOperation({
    summary: '헤더 에셋 상세 조회',
    description: 'ID로 특정 헤더 에셋의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '헤더 에셋 ID' })
  @ApiResponse({
    status: 200,
    description: '헤더 에셋 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HeaderAssetResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getHeaderAsset(@Param('id') id: string): Promise<HeaderAssetResponse> {
    return this.headerAssetService.findOne(id);
  }

  @Post('api/v1/admin/header-assets')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '헤더 에셋 생성',
    description: '새로운 헤더 에셋을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: HeaderAssetCreate })
  @ApiResponse({
    status: 201,
    description: '헤더 에셋 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HeaderAssetResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createHeaderAsset(
    @Body() createDto: HeaderAssetCreate,
    @Request() req: any,
  ): Promise<HeaderAssetResponse> {
    return this.headerAssetService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/header-assets/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '헤더 에셋 수정',
    description: '기존 헤더 에셋을 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '헤더 에셋 ID' })
  @ApiBody({ type: HeaderAssetUpdate })
  @ApiResponse({
    status: 200,
    description: '헤더 에셋 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HeaderAssetResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateHeaderAsset(
    @Param('id') id: string,
    @Body() updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    return this.headerAssetService.update(id, updateDto);
  }

  @Delete('api/v1/admin/header-assets/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '헤더 에셋 삭제',
    description: '헤더 에셋을 삭제합니다. (소프트 삭제, 관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '헤더 에셋 ID' })
  @ApiResponse({ status: 204, description: '헤더 에셋 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHeaderAsset(@Param('id') id: string): Promise<void> {
    return this.headerAssetService.delete(id);
  }
}
