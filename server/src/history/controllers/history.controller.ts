import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
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
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  HistoryCreate,
  HistoryUpdate,
  HistoryResponse,
  HistoryQuery,
} from '@/history/dto/history.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('History')
@Controller()
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get('api/v1/history')
  @ApiOperation({
    summary: '연혁 목록 조회',
    description: '연도별 정렬과 필터링을 지원하는 연혁 목록을 조회합니다. 페이지네이션을 지원합니다.',
  })
  @ApiQuery({ name: 'sort', required: false, description: '정렬 순서 (asc/desc)', example: 'desc' })
  @ApiQuery({ name: 'year', required: false, description: '연도 필터', example: 2024 })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기', example: 10 })
  @ApiResponse({
    status: 200,
    description: '연혁 목록 조회 성공',
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
                  items: { $ref: '#/components/schemas/HistoryResponse' },
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
  async getHistory(
    @Query() query: HistoryQuery,
  ): Promise<PagedResponse<HistoryResponse>> {
    return this.historyService.findAll(query);
  }

  @Get('api/v1/history/:id')
  @ApiOperation({
    summary: '연혁 상세 조회',
    description: 'ID로 특정 연혁의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiResponse({
    status: 200,
    description: '연혁 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HistoryResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getHistoryItem(@Param('id') id: string): Promise<HistoryResponse> {
    return this.historyService.findOne(id);
  }

  @Post('api/v1/admin/history')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '연혁 생성',
    description: '새로운 연혁을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: HistoryCreate })
  @ApiResponse({
    status: 201,
    description: '연혁 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HistoryResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createHistory(
    @Body() createDto: HistoryCreate,
  ): Promise<HistoryResponse> {
    return this.historyService.create(createDto);
  }

  @Put('api/v1/admin/history/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '연혁 수정',
    description: '기존 연혁 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiBody({ type: HistoryUpdate })
  @ApiResponse({
    status: 200,
    description: '연혁 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/HistoryResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateHistory(
    @Param('id') id: string,
    @Body() updateDto: HistoryUpdate,
  ): Promise<HistoryResponse> {
    return this.historyService.update(id, updateDto);
  }

  @Delete('api/v1/admin/history/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '연혁 삭제',
    description: '연혁을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '연혁 ID' })
  @ApiResponse({ status: 204, description: '연혁 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '연혁을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistory(@Param('id') id: string): Promise<void> {
    return this.historyService.delete(id);
  }
}
