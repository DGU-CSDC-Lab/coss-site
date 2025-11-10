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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PopupService } from '@/popup/services/popup.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  PopupCreate,
  PopupUpdate,
  PopupResponse,
  PopupQuery,
} from '@/popup/dto/popup.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('Popups')
@Controller()
export class PopupController {
  constructor(private popupService: PopupService) {}

  @Get('api/v1/popups')
  @ApiOperation({ summary: '팝업 목록 조회' })
  async getPopups(@Query() query: PopupQuery): Promise<PagedResponse<PopupResponse>> {
    return this.popupService.findAll(query);
  }

  @Get('api/v1/popups/active')
  @ApiOperation({ summary: '활성 팝업 조회' })
  async getActivePopups(): Promise<PopupResponse[]> {
    return this.popupService.findActive();
  }

  @Get('api/v1/popups/:id')
  @ApiOperation({ summary: '팝업 상세 조회' })
  @ApiResponse({ status: 404, description: '팝업을 찾을 수 없음' })
  async getPopup(@Param('id') id: string): Promise<PopupResponse> {
    return this.popupService.findOne(id);
  }

  @Post('api/v1/admin/popups')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '팝업 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createPopup(
    @Body() createDto: PopupCreate,
    @Request() req,
  ): Promise<PopupResponse> {
    return this.popupService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/popups/:id')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '팝업 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '팝업을 찾을 수 없음' })
  async updatePopup(
    @Param('id') id: string,
    @Body() updateDto: PopupUpdate,
  ): Promise<PopupResponse> {
    return this.popupService.update(id, updateDto);
  }

  @Delete('api/v1/admin/popups/:id')
  @UseGuards(RoleGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '팝업 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '팝업을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePopup(@Param('id') id: string): Promise<void> {
    return this.popupService.delete(id);
  }
}
