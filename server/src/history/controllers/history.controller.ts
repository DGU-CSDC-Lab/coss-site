import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
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
import { HistoryService } from '../services/history.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  HistoryCreate,
  HistoryUpdate,
  HistoryResponse,
  HistoryQuery,
} from '../dto/history.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@ApiTags('History')
@Controller()
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @ApiOperation({
    summary: '연혁 목록 조회',
    description:
      '연도별 정렬과 필터링을 지원하는 연혁 목록을 조회합니다. 페이지네이션을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '연혁 목록 조회 성공',
    type: PagedResponse<HistoryResponse>,
  })
  @Get('api/v1/history')
  async getHistory(
    @Query() query: HistoryQuery,
  ): Promise<PagedResponse<HistoryResponse>> {
    return this.historyService.findAll(query);
  }

  @ApiOperation({
    summary: '연혁 상세 조회',
    description: 'ID로 특정 연혁의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiResponse({
    status: 200,
    description: '연혁 상세 조회 성공',
    type: HistoryResponse,
  })
  @Get('api/v1/history/:id')
  async getHistoryItem(@Param('id') id: string): Promise<HistoryResponse> {
    return this.historyService.findOne(id);
  }

  @ApiOperation({
    summary: '연혁 생성',
    description: '새로운 연혁을 생성합니다. (관리자 권한 필요)',
  })
  @ApiResponse({
    status: 201,
    description: '연혁 생성 성공',
    type: HistoryResponse,
  })
  @Post('api/v1/admin/history')
  @UseGuards(AdminGuard)
  async createHistory(
    @Body() createDto: HistoryCreate,
  ): Promise<HistoryResponse> {
    return this.historyService.create(createDto);
  }

  @ApiOperation({
    summary: '연혁 수정',
    description: '기존 연혁 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiResponse({
    status: 200,
    description: '연혁 수정 성공',
    type: HistoryResponse,
  })
  @Put('api/v1/admin/history/:id')
  @UseGuards(AdminGuard)
  async updateHistory(
    @Param('id') id: string,
    @Body() updateDto: HistoryUpdate,
  ): Promise<HistoryResponse> {
    return this.historyService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '연혁 삭제',
    description: '연혁을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiResponse({ status: 204, description: '연혁 삭제 성공' })
  @Delete('api/v1/admin/history/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistory(@Param('id') id: string): Promise<void> {
    return this.historyService.delete(id);
  }
}
