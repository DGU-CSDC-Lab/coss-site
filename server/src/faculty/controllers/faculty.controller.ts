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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FacultyService } from '../services/faculty.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '../dto/faculty.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@ApiTags('Faculty')
@Controller()
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @ApiOperation({
    summary: '교수진 목록 조회',
    description:
      '전체 교수진 목록을 조회합니다. 페이지네이션과 검색을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '교수진 목록 조회 성공',
    type: PagedResponse<FacultyResponse>,
  })
  @Get('api/v1/faculty')
  async getFaculty(
    @Query() query: FacultyQuery,
  ): Promise<PagedResponse<FacultyResponse>> {
    return this.facultyService.findAll(query);
  }

  @ApiOperation({
    summary: '교수진 상세 조회',
    description: 'ID로 특정 교수진의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiResponse({
    status: 200,
    description: '교수진 상세 조회 성공',
    type: FacultyResponse,
  })
  @Get('api/v1/faculty/:id')
  async getFacultyMember(@Param('id') id: string): Promise<FacultyResponse> {
    return this.facultyService.findOne(id);
  }

  @ApiOperation({
    summary: '교수진 생성',
    description: '새로운 교수진 정보를 생성합니다. (관리자 권한 필요)',
  })
  @ApiResponse({
    status: 201,
    description: '교수진 생성 성공',
    type: FacultyResponse,
  })
  @Post('api/v1/admin/faculty')
  @UseGuards(AdminGuard)
  async createFaculty(
    @Body() createDto: FacultyCreate,
  ): Promise<FacultyResponse> {
    return this.facultyService.create(createDto);
  }

  @ApiOperation({
    summary: '교수진 수정',
    description: '기존 교수진 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiResponse({
    status: 200,
    description: '교수진 수정 성공',
    type: FacultyResponse,
  })
  @Put('api/v1/admin/faculty/:id')
  @UseGuards(AdminGuard)
  async updateFaculty(
    @Param('id') id: string,
    @Body() updateDto: FacultyUpdate,
  ): Promise<FacultyResponse> {
    return this.facultyService.update(id, updateDto);
  }

  @ApiOperation({
    summary: '교수진 삭제',
    description: '교수진 정보를 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiResponse({ status: 204, description: '교수진 삭제 성공' })
  @Delete('api/v1/admin/faculty/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFaculty(@Param('id') id: string): Promise<void> {
    return this.facultyService.delete(id);
  }
}
