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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseService } from '@/course/services/course.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import {
  CourseCreate,
  CourseUpdate,
  CourseResponse,
  CourseQuery,
  CourseUploadResult,
  CourseBulkInitRequest,
} from '@/course/dto/course.dto';
import { PagedResponse } from '@/common/dto/response.dto';

@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get('api/v1/courses')
  @ApiOperation({
    summary: '교과목 목록 조회',
    description: '페이지네이션, 검색, 정렬을 지원하는 교과목 목록을 조회합니다. 과목명, 학과, 학수번호, 수강학년으로 검색 및 정렬 가능합니다.',
  })
  @ApiQuery({ name: 'year', required: false, description: '연도 필터', example: 2024 })
  @ApiQuery({ name: 'semester', required: false, description: '학기 필터', example: '1학기' })
  @ApiQuery({ name: 'department', required: false, description: '학과명 검색', example: '지능IoT학과' })
  @ApiQuery({ name: 'name', required: false, description: '교과목명 검색', example: '프로그래밍' })
  @ApiQuery({ name: 'code', required: false, description: '교과목 코드 검색', example: 'CS101' })
  @ApiQuery({ name: 'grade', required: false, description: '학년 검색', example: '1' })
  @ApiQuery({ name: 'sortBy', required: false, description: '정렬 기준', example: 'name' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '정렬 순서', example: 'ASC' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기', example: 20 })
  @ApiResponse({
    status: 200,
    description: '교과목 목록 조회 성공',
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
                  items: { $ref: '#/components/schemas/CourseResponse' },
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
  async getCourses(
    @Query() query: CourseQuery,
  ): Promise<PagedResponse<CourseResponse>> {
    return this.courseService.findAll(query);
  }

  @Get('api/v1/courses/:id')
  @ApiOperation({
    summary: '교과목 상세 조회',
    description: 'ID로 특정 교과목의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({
    status: 200,
    description: '교과목 상세 조회 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getCourse(@Param('id') id: string): Promise<CourseResponse> {
    return this.courseService.findOne(id);
  }

  @Post('api/v1/admin/courses')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 생성',
    description: '새로운 교과목을 생성합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseCreate })
  @ApiResponse({
    status: 201,
    description: '교과목 생성 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async createCourse(@Body() createDto: CourseCreate): Promise<CourseResponse> {
    return this.courseService.create(createDto);
  }

  @Put('api/v1/admin/courses/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 수정',
    description: '기존 교과목 정보를 수정합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiBody({ type: CourseUpdate })
  @ApiResponse({
    status: 200,
    description: '교과목 수정 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseResponse' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateDto: CourseUpdate,
  ): Promise<CourseResponse> {
    return this.courseService.update(id, updateDto);
  }

  @Delete('api/v1/admin/courses/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 삭제',
    description: '교과목을 삭제합니다. (관리자 권한 필요)',
  })
  @ApiParam({ name: 'id', description: '교과목 ID' })
  @ApiResponse({ status: 204, description: '교과목 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 404, description: '교과목을 찾을 수 없음' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') id: string): Promise<void> {
    return this.courseService.delete(id);
  }

  @Post('api/v1/admin/courses/bulk-init')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '년도/학기별 교과목 초기화',
    description: '특정 년도/학기의 모든 교과목을 삭제하고 새로운 교과목 목록으로 초기화합니다. (관리자 권한 필요)',
  })
  @ApiBody({ type: CourseBulkInitRequest })
  @ApiResponse({
    status: 201,
    description: '교과목 초기화 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @HttpCode(HttpStatus.CREATED)
  async bulkInitCourses(
    @Body() request: CourseBulkInitRequest,
  ): Promise<CourseUploadResult> {
    return this.courseService.bulkInit(
      request.year,
      request.semester,
      request.courses,
    );
  }

  @Post('api/v1/admin/courses/upload')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: '교과목 일괄 업로드',
    description: 'CSV 파일로 교과목을 일괄 업로드합니다. (관리자 권한 필요)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '교과목 업로드 성공',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/SuccessResponse' },
        {
          properties: {
            data: { $ref: '#/components/schemas/CourseUploadResult' },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'CSV 형식이 아니거나 헤더 행이 부족함' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadCourses(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CourseUploadResult> {
    return this.courseService.uploadFromFile(file.buffer, file.originalname);
  }
}
