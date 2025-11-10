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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HeaderAssetService } from '@/header-asset/services/header-asset.service';
import { RoleGuard } from '@/auth/guards/role.guard';
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
  @ApiOperation({ summary: '헤더 에셋 목록 조회' })
  async getHeaderAssets(@Query() query: HeaderAssetQuery): Promise<PagedResponse<HeaderAssetResponse>> {
    return this.headerAssetService.findAll(query);
  }

  @Get('api/v1/header-assets/:id')
  @ApiOperation({ summary: '헤더 에셋 상세 조회' })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  async getHeaderAsset(@Param('id') id: string): Promise<HeaderAssetResponse> {
    return this.headerAssetService.findOne(id);
  }

  @Post('api/v1/admin/header-assets')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '헤더 에셋 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createHeaderAsset(
    @Body() createDto: HeaderAssetCreate,
    @Request() req: any,
  ): Promise<HeaderAssetResponse> {
    return this.headerAssetService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/header-assets/:id')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '헤더 에셋 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  async updateHeaderAsset(
    @Param('id') id: string,
    @Body() updateDto: HeaderAssetUpdate,
  ): Promise<HeaderAssetResponse> {
    return this.headerAssetService.update(id, updateDto);
  }

  @Delete('api/v1/admin/header-assets/:id')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '헤더 에셋 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '헤더 에셋을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHeaderAsset(@Param('id') id: string): Promise<void> {
    return this.headerAssetService.delete(id);
  }
}
