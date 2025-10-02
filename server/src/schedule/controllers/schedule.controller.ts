import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ScheduleService } from '../services/schedule.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleQuery } from '../dto/schedule.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@ApiTags('Academic Schedules')
@Controller()
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @ApiOperation({ 
    summary: '학사일정 목록 조회', 
    description: '전체 학사일정을 조회하거나 월별/연도별/카테고리별로 필터링하여 조회합니다. 페이지네이션을 지원합니다.' 
  })
  @ApiResponse({ status: 200, description: '학사일정 목록 (시작일 기준 오름차순 정렬)', type: PagedResponse<ScheduleResponse> })
  @Get('api/v1/schedules')
  async getSchedules(@Query() query: ScheduleQuery): Promise<PagedResponse<ScheduleResponse>> {
    return this.scheduleService.findAll(query);
  }

  @ApiOperation({ summary: '학사일정 상세 조회', description: 'ID로 특정 학사일정을 조회합니다.' })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiResponse({ status: 200, description: '학사일정 상세 정보', type: ScheduleResponse })
  @Get('api/v1/schedules/:id')
  async getSchedule(@Param('id') id: string): Promise<ScheduleResponse> {
    return this.scheduleService.findOne(id);
  }

  @ApiOperation({ summary: '학사일정 생성', description: '새로운 학사일정을 생성합니다. (관리자 권한 필요)' })
  @ApiResponse({ status: 201, description: '학사일정 생성 성공', type: ScheduleResponse })
  @Post('api/v1/admin/schedules')
  @UseGuards(AdminGuard)
  async createSchedule(@Body() createDto: ScheduleCreate, @Request() req): Promise<ScheduleResponse> {
    return this.scheduleService.create(createDto, req.user.id);
  }

  @ApiOperation({ summary: '학사일정 수정', description: '기존 학사일정을 수정합니다. (관리자 권한 필요)' })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiResponse({ status: 200, description: '학사일정 수정 성공', type: ScheduleResponse })
  @Put('api/v1/admin/schedules/:id')
  @UseGuards(AdminGuard)
  async updateSchedule(@Param('id') id: string, @Body() updateDto: ScheduleUpdate): Promise<ScheduleResponse> {
    return this.scheduleService.update(id, updateDto);
  }

  @ApiOperation({ summary: '학사일정 삭제', description: '학사일정을 삭제합니다. (관리자 권한 필요)' })
  @ApiParam({ name: 'id', description: '학사일정 ID' })
  @ApiResponse({ status: 204, description: '학사일정 삭제 성공' })
  @Delete('api/v1/admin/schedules/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(@Param('id') id: string): Promise<void> {
    return this.scheduleService.delete(id);
  }
}
