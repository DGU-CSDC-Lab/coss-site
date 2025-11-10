import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FacultyService } from '@/faculty/services/faculty.service';
import { RoleGuard } from '@/auth/guards/role.guard';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '@/faculty/dto/faculty.dto';
import { PagedResponse } from '@/common/dto/response.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/auth/entities';

@ApiTags('Faculty')
@Controller()
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Get('api/v1/faculty')
  @ApiOperation({ summary: '교수진 목록 조회' })
  async getFaculty(@Query() query: FacultyQuery): Promise<PagedResponse<FacultyResponse>> {
    return this.facultyService.findAll(query);
  }

  @Get('api/v1/faculty/:id')
  @ApiOperation({ summary: '교수진 상세 조회' })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  async getFacultyMember(@Param('id') id: string): Promise<FacultyResponse> {
    return this.facultyService.findOne(id);
  }

  @Post('api/v1/admin/faculty')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교수진 생성' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @HttpCode(HttpStatus.CREATED)
  async createFaculty(@Body() createDto: FacultyCreate): Promise<FacultyResponse> {
    return this.facultyService.create(createDto);
  }

  @Put('api/v1/admin/faculty/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교수진 수정' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  async updateFaculty(
    @Param('id') id: string,
    @Body() updateDto: FacultyUpdate,
  ): Promise<FacultyResponse> {
    return this.facultyService.update(id, updateDto);
  }

  @Delete('api/v1/admin/faculty/:id')
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: '교수진 삭제' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFaculty(@Param('id') id: string): Promise<void> {
    return this.facultyService.delete(id);
  }
}
