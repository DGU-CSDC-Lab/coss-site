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
import { ScheduleService } from '@/schedule/services/schedule.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleResponse,
  ScheduleQuery,
} from '@/schedule/dto/schedule.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Academic Schedules')
@Controller()
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('api/v1/schedules')
  @ApiOperation({ summary: '학사일정 목록 조회' })
  async getSchedules(@Query() query: ScheduleQuery): Promise<PagedResponse<ScheduleResponse>> {
    return this.scheduleService.findAll(query);
  }

  @Get('api/v1/schedules/:id')
  @ApiOperation({ summary: '학사일정 상세 조회' })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  async getSchedule(@Param('id') id: string): Promise<ScheduleResponse> {
    return this.scheduleService.findOne(id);
  }

  @Post('api/v1/admin/schedules')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '학사일정 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Body() createDto: ScheduleCreate,
    @Request() req,
  ): Promise<ScheduleResponse> {
    return this.scheduleService.create(createDto, req.user.id);
  }

  @Put('api/v1/admin/schedules/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '학사일정 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateDto: ScheduleUpdate,
  ): Promise<ScheduleResponse> {
    return this.scheduleService.update(id, updateDto);
  }

  @Delete('api/v1/admin/schedules/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '학사일정 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '학사일정을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(@Param('id') id: string): Promise<void> {
    return this.scheduleService.delete(id);
  }
}
