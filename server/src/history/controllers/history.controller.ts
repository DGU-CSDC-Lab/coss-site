import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import { HistoryService } from '@/history/services/history.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  HistoryCreate,
  HistoryUpdate,
  HistoryResponse,
  HistoryQuery,
} from '@/history/dto/history.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('History')
@Controller()
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get('api/v1/history')
  @ApiOperation({ summary: '연혁 목록 조회' })
  async getHistory(@Query() query: HistoryQuery): Promise<PagedResponse<HistoryResponse>> {
    return this.historyService.findAll(query);
  }

  @Get('api/v1/history/:id')
  @ApiOperation({ summary: '연혁 상세 조회' })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  async getHistoryItem(@Param('id') id: string): Promise<HistoryResponse> {
    return this.historyService.findOne(id);
  }

  @Post('api/v1/admin/history')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '연혁 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createHistory(@Body() createDto: HistoryCreate): Promise<HistoryResponse> {
    return this.historyService.create(createDto);
  }

  @Put('api/v1/admin/history/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '연혁 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  async updateHistory(
    @Param('id') id: string,
    @Body() updateDto: HistoryUpdate,
  ): Promise<HistoryResponse> {
    return this.historyService.update(id, updateDto);
  }

  @Delete('api/v1/admin/history/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '연혁 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistory(@Param('id') id: string): Promise<void> {
    return this.historyService.delete(id);
  }
}
