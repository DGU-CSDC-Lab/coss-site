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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { HeaderAssetService } from '../services/header-asset.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  HeaderAssetCreate,
  HeaderAssetUpdate,
  HeaderAssetResponse,
  HeaderAssetQuery,
} from '../dto/header-asset.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@ApiTags('Header Assets')
@Controller()
export class HeaderAssetController {
  constructor(private headerAssetService: HeaderAssetService) {}

  @ApiOperation({
    summary: '헤더 요소 목록 조회',
    description:
      '헤더 요소 목록을 조회합니다. 페이지네이션을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '헤더 요소 목록 조회 성공',
    type: PagedResponse<HeaderAssetResponse>,
  })
  @Get('api/v1/header-assets')
  async getHeaderAssets(
    @Query() query: HeaderAssetQuery,
  ): Promise<PagedResponse<HeaderAssetResponse>> {
    return this.headerAssetService.findAll(query);
  }

  @ApiOperation({
    summary: '헤더 요소 상세 조회',
    description: 'ID로 특정 헤더 요소의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '헤더 요소 ID' })
  @ApiResponse({
    status: 200,
    description: '헤더 요소 상세 조회 성공',
    type: HeaderAssetResponse,
  })
  @Get('api/v1/header-assets/:id')
  async getHeaderAsset(@Param('id') id: string): Promise<HeaderAssetResponse> {
    return this.headerAssetService.findOne(id);
  }

  @ApiOperation({
    summary: '헤더 요소 생성',
    description: '새로운 헤더 요소를 생성합니다. 관리자 권한이 필요합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '헤더 요소 생성 성공',
    type: HeaderAssetResponse,
  })
  @Post('api/v1/admin/header-assets')
  @UseGuards(AdminGuard)
  async createHeaderAsset(
    @Body() createDto: HeaderAssetCreate,
    @Request() req: any,
  ): Promise<HeaderAssetResponse> {
    console.log('Controller - req.user:', req.user);
    console.log('Controller - req.user.id:', req.user?.id);
    return this.headerAssetService.create(createDto, req.user.id);
  }

  @ApiOperation({
    summary: '헤더 요소 수정',
    description: '기존 헤더 요소를 수정합니다. 관리자 권한이 필요합니다.',
  })
  @ApiParam({ name: 'id', description: '헤더 요소 ID' })
  @ApiResponse({
    status: 200,
    description: '헤더 요소 수정 성공',
    type: HeaderAssetResponse,
  })
  @Put('api/v1/admin/header-assets/:id')
  @UseGuards(AdminGuard)
  async updateHeaderAsset(
    @Param('id') id: string,
    @Body() updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    return this.headerAssetService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '헤더 요소 삭제',
    description: '헤더 요소를 삭제합니다. 관리자 권한이 필요합니다.',
  })
  @ApiParam({ name: 'id', description: '헤더 요소 ID' })
  @ApiResponse({ status: 204, description: '헤더 요소 삭제 성공' })
  @Delete('api/v1/admin/header-assets/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHeaderAsset(@Param('id') id: string): Promise<void> {
    return this.headerAssetService.delete(id);
  }
}
