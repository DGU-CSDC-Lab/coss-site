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
import { ScheduleService } from '@/schedule/services/schedule.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleResponse,
  ScheduleQuery,
} from '@/schedule/dto/schedule.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('Academic Schedules')
@Controller()
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('api/v1/schedules')
  @ApiOperation({
    summary: '학사일정 목록 조회',
    description: '전체 학사일정을 조회하거나 월별/연도별/카테고리별로 필터링하여 조회합니다. 일정명으로 키워드 검색도 가능합니다. 페이지네이션을 지원합니다.',
  })
  @ApiQuery({ name: 'month', required: false, description: '월별 필터 (YYYY-MM)', example: '2024-03' })
  @ApiQuery({ name: 'category', required: false, description: '카테고리 필터', example: 'ACADEMIC' })
  @ApiQuery({ name: 'year', required: false, description: '연도 필터', example: '2024' })
  @ApiQuery({ name: 'date', required: false, description: '특정 날짜 필터 (YYYY-MM-DD)', example: '2024-03-15' })
  @ApiQuery({ name: 'search', required: false, description: '제목 검색 키워드', example: '입학식' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기', example: 10 })
  @ApiResponse({
    status: 200,
    description: '학사일정 목록 조회 성공 (시작일 기준 오름차순 정렬)',
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
                  items: { $ref: '#/components/schemas/ScheduleResponse' },
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
  async getSchedules(
    @Query() query: ScheduleQuery,
  ): Promise<PagedResponse<ScheduleResponse>> {
    return this.scheduleService.findAll(query);
  }

  @Get('api/v1/schedules/:id')
  @ApiOperation({
    summary: '학사일정 상세 조회',
    description: 'ID로 특정 학사일정을 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiResponse({
    status: 200,
    description: '학사일정 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/ScheduleResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getSchedule(@Param('id') id: string): Promise<ScheduleResponse> {
    return this.scheduleService.findOne(id);
  }

  @Post('api/v1/admin/schedules')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '학사일정 생성',
    description: '새로운 학사일정을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: ScheduleCreate })
  @ApiResponse({
    status: 201,
    description: '학사일정 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/ScheduleResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body() createDto: ScheduleCreate,
    @Request() req,
  ): Promise<ScheduleResponse> {
    return this.scheduleService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/schedules/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '학사일정 수정',
    description: '기존 학사일정을 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiBody({ type: ScheduleUpdate })
  @ApiResponse({
    status: 200,
    description: '학사일정 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/ScheduleResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateDto: ScheduleUpdate,
  ): Promise<ScheduleResponse> {
    return this.scheduleService.update(id, updateDto);
  }

  @Delete('api/v1/admin/schedules/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '학사일정 삭제',
    description: '학사일정을 삭제합니다. (소프트 삭제, 관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiResponse({ status: 204, description: '학사일정 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(@Param('id') id: string): Promise<void> {
    return this.scheduleService.delete(id);
  }
}
