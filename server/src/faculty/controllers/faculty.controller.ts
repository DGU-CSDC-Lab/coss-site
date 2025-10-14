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
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FacultyService } from '@/faculty/services/faculty.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  FacultyCreate,
  FacultyUpdate,
  FacultyResponse,
  FacultyQuery,
} from '@/faculty/dto/faculty.dto';
import { PagedResponse, SuccessResponse } from '@/common/dto/response.dto';

@ApiTags('Faculty')
@Controller()
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Get('api/v1/faculty')
  @ApiOperation({
    summary: '교수진 목록 조회',
    description:
      '전체 교수진 목록을 조회합니다. 페이지네이션과 검색을 지원합니다.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: '교수 이름으로 검색',
    example: '김교수',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    description: '학과명으로 검색',
    example: '지능IoT학과',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기 (기본값: 20)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '교수진 목록 조회 성공',
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
                  items: { $ref: '#/components/schemas/FacultyResponse' },
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
  async getFaculty(
    @Query() query: FacultyQuery,
  ): Promise<PagedResponse<FacultyResponse>> {
    return this.facultyService.findAll(query);
  }

  @Get('api/v1/faculty/:id')
  @ApiOperation({
    summary: '교수진 상세 조회',
    description: 'ID로 특정 교수진의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiResponse({
    status: 200,
    description: '교수진 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/FacultyResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getFacultyMember(@Param('id') id: string): Promise<FacultyResponse> {
    return this.facultyService.findOne(id);
  }

  @Post('api/v1/admin/faculty')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교수진 생성',
    description: '새로운 교수진 정보를 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: FacultyCreate })
  @ApiResponse({
    status: 201,
    description: '교수진 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/FacultyResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createFaculty(
    @Body() createDto: FacultyCreate,
  ): Promise<FacultyResponse> {
    return this.facultyService.create(createDto);
  }

  @Put('api/v1/admin/faculty/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교수진 수정',
    description: '기존 교수진 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiBody({ type: FacultyUpdate })
  @ApiResponse({
    status: 200,
    description: '교수진 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/FacultyResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateFaculty(
    @Param('id') id: string,
    @Body() updateDto: FacultyUpdate,
  ): Promise<FacultyResponse> {
    return this.facultyService.update(id, updateDto);
  }

  @Delete('api/v1/admin/faculty/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교수진 삭제',
    description: '교수진 정보를 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교수진 ID' })
  @ApiResponse({ status: 204, description: '교수진 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교수진을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFaculty(@Param('id') id: string): Promise<void> {
    return this.facultyService.delete(id);
  }
}
